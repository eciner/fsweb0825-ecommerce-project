package com.eciner.ecommerce.auth;

import com.eciner.ecommerce.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMillis;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration}") long expirationMillis) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET must be configured.");
        }

        byte[] decodedSecret = secret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        if (decodedSecret.length < 32) {
            throw new IllegalStateException("JWT_SECRET must contain at least 256 bits.");
        }
        if (expirationMillis <= 0) {
            throw new IllegalStateException("JWT_EXPIRATION must be positive.");
        }

        this.signingKey = Keys.hmacShaKeyFor(decodedSecret);
        this.expirationMillis = expirationMillis;
    }

    public String issue(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("user_id", user.getId())
                .claim("role_code", user.getRole().getCode())
                .id(UUID.randomUUID().toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMillis)))
                .signWith(signingKey)
                .compact();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isValid(String token, String expectedEmail) {
        try {
            Claims claims = parseClaims(token);
            return expectedEmail.equalsIgnoreCase(claims.getSubject())
                    && claims.getExpiration().after(new Date());
        } catch (RuntimeException exception) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
    }
}