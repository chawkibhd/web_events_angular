package com.projet.eventsservice.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projet.eventsservice.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Récupérer les utilisateurs par rôle (ex: PARTICIPANT)
    List<User> findByRoleIgnoreCase(String role);

    // Case-insensitive helpers to avoid duplicates/login échecs sur la casse
    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
