package com.eventplanner.backend.service;

import com.eventplanner.backend.model.RefreshToken;
import com.eventplanner.backend.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepo;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepo) {
        this.refreshTokenRepo = refreshTokenRepo;
    }

    public RefreshToken create(String userId, String token, Date expiresAt) {
        // delete old refresh tokens for same user (optional, ensures 1 active at a time)
        refreshTokenRepo.deleteByUserId(userId);

        RefreshToken refreshToken = new RefreshToken(userId, token, expiresAt);
        return refreshTokenRepo.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepo.findByToken(token);
    }

    public void delete(RefreshToken token) {
        refreshTokenRepo.delete(token);
    }
}
