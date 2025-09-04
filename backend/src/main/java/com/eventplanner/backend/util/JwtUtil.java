package com.eventplanner.backend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    private final Key key;

    // Access token: 15 minutes
    private static final long ACCESS_TOKEN_EXPIRATION_MS = 1000L * 60 * 15;

    // Refresh token: 7 days
    private static final long REFRESH_TOKEN_EXPIRATION_MS = 1000L * 60 * 60 * 24 * 7;

    public JwtUtil(@Value("${jwt.secret:}") String secret) {
        // If secret is not provided or too short, auto-generate a secure key (development only)
        if (secret == null || secret.trim().length() < 32) {
            this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
            System.out.println("⚠️ JWT_SECRET not set or too short. Auto-generated secure key (use env var in prod).");
        } else {
            this.key = Keys.hmacShaKeyFor(secret.getBytes());
        }
    }

    /* ------------------ Token generation ------------------ */

    public String generateAccessToken(String username) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + ACCESS_TOKEN_EXPIRATION_MS);
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String username) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + REFRESH_TOKEN_EXPIRATION_MS);
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /* ------------------ Claim extraction helpers ------------------ */

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /* ------------------ Validation helpers ------------------ */

    public boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (Exception ex) {
            return true;
        }
    }

    /**
     * Lightweight validity check: token parses and is not expired.
     * Useful for refresh-token checks where you don't have UserDetails.
     */
    public boolean isValid(String token) {
        try {
            extractAllClaims(token);           // ensures signature & structure ok
            return !isTokenExpired(token);     // ensure not expired
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Full validation against a username (email).
     */
    public boolean validateToken(String token, String username) {
        try {
            final String tokenEmail = extractEmail(token);
            return (tokenEmail != null && tokenEmail.equals(username) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }
}
