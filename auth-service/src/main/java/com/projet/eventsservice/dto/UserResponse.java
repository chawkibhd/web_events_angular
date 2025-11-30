package com.projet.eventsservice.dto;

import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String role;
}
