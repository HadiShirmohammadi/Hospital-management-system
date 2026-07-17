package com.Hospital.backend.Service;

import io.jsonwebtoken.security.Keys;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;

@Service
public class JwtService {
    private final Key key;
    public JwtService(@Value("${JWT_SECRET}") String secretString){
        this.key = Keys.hmacShaKeyFor(secretString.getBytes());
    }
}
