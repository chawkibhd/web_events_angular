package com.projet.eventsservice.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "registrations")
@Data
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long eventId;        // l'événement concerné
    private Long participantId;  // plus tard: lien vers un vrai user

    private LocalDateTime dateInscription;

    private String statut;       // INSCRIT, ANNULE, EN_ATTENTE
}
