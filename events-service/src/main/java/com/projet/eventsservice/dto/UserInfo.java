package com.projet.eventsservice.dto;

import lombok.Data;

@Data
public class UserInfo {
    private Long id;
    private String email;
    private String fullName;
    private String role;
}
