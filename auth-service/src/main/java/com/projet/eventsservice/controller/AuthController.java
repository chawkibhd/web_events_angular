package com.projet.eventsservice.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projet.eventsservice.TokenService;
import com.projet.eventsservice.dto.LoginRequest;
import com.projet.eventsservice.dto.LoginResponse;
import com.projet.eventsservice.dto.RegisterRequest;
import com.projet.eventsservice.dto.UserResponse;
import com.projet.eventsservice.model.User;
import com.projet.eventsservice.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
// Autorise le front quel que soit le port dev
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = { org.springframework.web.bind.annotation.RequestMethod.GET,
        org.springframework.web.bind.annotation.RequestMethod.POST, org.springframework.web.bind.annotation.RequestMethod.PUT,
        org.springframework.web.bind.annotation.RequestMethod.DELETE, org.springframework.web.bind.annotation.RequestMethod.OPTIONS })
public class AuthController {

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository, TokenService tokenService) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
    }

    private UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole());
        return response;
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {

        String normalizedEmail = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
        String normalizedRole = request.getRole() == null ? "" : request.getRole().trim().toUpperCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            return ResponseEntity.badRequest().body("Email déjà utilisé.");
        }

        if (normalizedEmail.isBlank() || request.getPassword() == null || request.getPassword().isBlank()
                || normalizedRole.isBlank() || request.getFullName() == null || request.getFullName().isBlank()) {
            return ResponseEntity.badRequest().body("Champs requis manquants.");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setFullName(request.getFullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(normalizedRole);
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

        return ResponseEntity.ok("Utilisateur créé avec succès.");
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {

        String normalizedEmail = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
        if (normalizedEmail.isBlank() || request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body("Email et mot de passe sont requis.");
        }

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Identifiants invalides.");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body("Identifiants invalides.");
        }

        String token = tokenService.generateToken(user);

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole());

        return ResponseEntity.ok(response);
    }

    // POST /api/auth/logout
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("X-Auth-Token") String token) {
        tokenService.invalidateToken(token);
        return ResponseEntity.ok("Déconnecté.");
    }

    // GET /api/auth/users/{id} : expose les infos publiques d'un utilisateur
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(toUserResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/auth/users/participants : liste de tous les utilisateurs avec le rôle PARTICIPANT
    @GetMapping("/users/participants")
    public List<UserResponse> getAllParticipants() {
        return userRepository.findByRoleIgnoreCase("PARTICIPANT")
                .stream()
                .map(this::toUserResponse)
                .toList();
    }
}
