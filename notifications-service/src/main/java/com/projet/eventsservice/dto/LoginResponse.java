package com.projet.eventsservice.dto;

import lombok.Data;

@Data
public class LoginResponse {

    private String token;
    private Long userId;
    private String email;
    private String fullName;
    private String role;
}