package com.projet.eventsservice;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.projet.eventsservice.model.User;

@Service
public class TokenService {

    private final Map<String, User> tokens = new ConcurrentHashMap<>();

    public String generateToken(User user) {
        String token = UUID.randomUUID().toString();
        tokens.put(token, user);
        return token;
    }

    public User getUserByToken(String token) {
        return tokens.get(token);
    }

    public void invalidateToken(String token) {
        tokens.remove(token);
    }
}