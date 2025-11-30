package com.projet.eventsservice.service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.projet.eventsservice.dto.UserInfo;

@Service
public class NotificationClient {

    private final RestTemplate restTemplate;
    private final String notificationsBaseUrl = "http://localhost:8083/api/notifications";
    private final String authBaseUrl = "http://localhost:8082/api/auth/users";

    public NotificationClient(RestTemplateBuilder builder) {
        this.restTemplate = builder.build();
    }

    public void sendNotification(Long destinataireId, Long eventId, String type, String message) {
        Map<String, Object> body = Map.of(
                "participantId", destinataireId,
                "eventId", eventId,
                "type", type,
                "message", message
        );

        try {
            restTemplate.postForEntity(notificationsBaseUrl, body, Void.class);
        } catch (RuntimeException e) {
            System.err.println("Erreur lors de l'envoi de la notification : " + e.getMessage());
        }
    }

    public UserInfo fetchUser(Long userId) {
        try {
            return restTemplate.getForObject(authBaseUrl + "/" + userId, UserInfo.class);
        } catch (RuntimeException e) {
            System.err.println("Impossible de récupérer l'utilisateur " + userId + " : " + e.getMessage());
            return null;
        }
    }

    public List<UserInfo> fetchParticipants() {
        try {
            UserInfo[] users = restTemplate.getForObject(authBaseUrl + "/participants", UserInfo[].class);
            if (users == null) {
                return List.of();
            }
            return Arrays.asList(users);
        } catch (RuntimeException e) {
            System.err.println("Impossible de récupérer la liste des participants : " + e.getMessage());
            return List.of();
        }
    }
}
