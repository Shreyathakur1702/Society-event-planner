package com.eventplanner.backend.controller;

import com.eventplanner.backend.model.RefreshToken;
import com.eventplanner.backend.model.User;
import com.eventplanner.backend.repository.UserRepository;
import com.eventplanner.backend.service.RefreshTokenService;
import com.eventplanner.backend.util.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshSvc;

    private static final String REFRESH_COOKIE = "refreshToken";

    public AuthController(AuthenticationManager authManager,
                          UserRepository userRepo,
                          PasswordEncoder encoder,
                          JwtUtil jwtUtil,
                          RefreshTokenService refreshSvc) {
        this.authManager = authManager;
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
        this.refreshSvc = refreshSvc;
    }

    /* -------------------- REGISTER -------------------- */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }
        user.setPassword(encoder.encode(user.getPassword()));
        user.setRole("USER");
        User saved = userRepo.save(user);
        saved.setPassword(null); // don’t expose hash
        return ResponseEntity.ok(saved);
    }

    /* -------------------- LOGIN -------------------- */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials,
                                   HttpServletResponse response) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        credentials.get("email"), credentials.get("password"))
        );

        String email = auth.getName();
        User user = userRepo.findByEmail(email).orElseThrow();

        // ✅ Generate tokens
        String accessToken = jwtUtil.generateAccessToken(email);
        String refreshToken = jwtUtil.generateRefreshToken(email);
        Date expiresAt = jwtUtil.extractExpiration(refreshToken);

        // ✅ Save only refresh token in DB
        refreshSvc.create(user.getId(), refreshToken, expiresAt);

        // ✅ Store refresh token in secure cookie
        Cookie cookie = new Cookie(REFRESH_COOKIE, refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true); // ⚠ MUST be true in production (requires HTTPS)
        cookie.setPath("/");
        cookie.setMaxAge((int) (7 * 24 * 60 * 60)); // 7 days
        response.addCookie(cookie);

        // ✅ Return access token only (refresh token is in cookie)
        return ResponseEntity.ok(Map.of("accessToken", accessToken));
    }

    /* -------------------- REFRESH TOKEN -------------------- */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(value = REFRESH_COOKIE, required = false) String rt) {
        if (rt == null) return ResponseEntity.status(401).body(Map.of("error", "No refresh token"));

        Optional<RefreshToken> stored = refreshSvc.findByToken(rt);
        if (stored.isEmpty() || !jwtUtil.isValid(rt)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired refresh token"));
        }

        String email = jwtUtil.extractEmail(rt);
        String newAccessToken = jwtUtil.generateAccessToken(email);
        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }

    /* -------------------- LOGOUT -------------------- */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(value = REFRESH_COOKIE, required = false) String rt,
                                    HttpServletResponse res) {
        if (rt != null) {
            refreshSvc.findByToken(rt).ifPresent(refreshSvc::delete);
            Cookie cleared = new Cookie(REFRESH_COOKIE, "");
            cleared.setHttpOnly(true);
            cleared.setPath("/");
            cleared.setMaxAge(0);
            cleared.setSecure(true); // ⚠ in production
            res.addCookie(cleared);
        }
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    /* -------------------- CURRENT USER -------------------- */
    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        return userRepo.findByEmail(email)
                .<ResponseEntity<?>>map(user -> {
                    user.setPassword(null);
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.status(404).body(Map.of("error", "User not found")));
    }
}