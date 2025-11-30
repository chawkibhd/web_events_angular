package com.projet.eventsservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String fullName;

    @NotBlank
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;

    // "PARTICIPANT" ou "ORGANISATEUR"
    @NotBlank
    private String role;
}