package com.projet.eventsservice.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "events")
@Data
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;
    private String description;
    private String lieu;

    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;

    private String type;          // conférence, formation, etc.
    private String imageUrl;      // URL de l’affiche
    private String programmeUrl;  // URL du programme PDF

    private Long organisateurId;  // pour le lien avec l’organisateur plus tard
}