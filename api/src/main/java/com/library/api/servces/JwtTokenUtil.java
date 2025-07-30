package com.library.api.servces;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import com.library.api.entity.User;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenUtil {
    private static final String SECRET = "YourSecretKeyMustBeLongEnoughForHS512WhichRequires64BytesLongSecretKey";
    private static final long EXPIRATION_TIME = 864_000_000; // 10 days
    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    public String generateToken(User user) {
        return Jwts.builder()
            .setSubject(user.getEmail())
            .claim("role", user.getRole().name())
            .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
            .signWith(key, SignatureAlgorithm.HS512)
            .compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}