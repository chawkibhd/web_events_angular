package com.projet.eventsservice.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "notifications")
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long participantId;     // destinataire
    private Long eventId;           // événement lié (optionnel)
    
    private String type;            // CONFIRMATION_INSCRIPTION, ANNULATION_INSCRIPTION, RAPPEL, etc.
    private String message;

    private LocalDateTime dateCreation;

    private boolean lue;            // true = déjà vue par le participant
}