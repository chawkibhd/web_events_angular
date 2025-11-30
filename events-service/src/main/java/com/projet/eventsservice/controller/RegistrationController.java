package com.projet.eventsservice.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projet.eventsservice.dto.UserInfo;
import com.projet.eventsservice.model.Event;
import com.projet.eventsservice.model.Registration;
import com.projet.eventsservice.repository.EventRepository;
import com.projet.eventsservice.repository.RegistrationRepository;
import com.projet.eventsservice.service.NotificationClient;

@RestController
@RequestMapping("/api/registrations")
@CrossOrigin(origins = "*")
public class RegistrationController {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final NotificationClient notificationClient;

    public RegistrationController(RegistrationRepository registrationRepository, EventRepository eventRepository,
            NotificationClient notificationClient) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.notificationClient = notificationClient;
    }

    private String resolveEventTitle(Long eventId, Event event) {
        return event != null && event.getTitre() != null
                ? event.getTitre()
                : "l’événement " + eventId;
    }

    private String buildOrganizerRegistrationMessage(Registration registration, Event event) {
        String eventTitle = resolveEventTitle(registration.getEventId(), event);
        UserInfo participant = notificationClient.fetchUser(registration.getParticipantId());

        if (participant != null) {
            String name = participant.getFullName() != null ? participant.getFullName() : "Participant " + participant.getId();
            String email = participant.getEmail() != null ? participant.getEmail() : "email inconnu";
            return name + " (" + email + ") s’est inscrit à " + eventTitle + " (id " + registration.getParticipantId() + ").";
        }

        return "Le participant (id " + registration.getParticipantId() + ") s’est inscrit à " + eventTitle + ".";
    }

    private String buildOrganizerUnregisterMessage(Registration registration, Event event) {
        String eventTitle = resolveEventTitle(registration.getEventId(), event);
        UserInfo participant = notificationClient.fetchUser(registration.getParticipantId());

        if (participant != null) {
            String name = participant.getFullName() != null ? participant.getFullName() : "Participant " + participant.getId();
            String email = participant.getEmail() != null ? participant.getEmail() : "email inconnu";
            return name + " (" + email + ") s’est désinscrit de " + eventTitle + " (id " + registration.getParticipantId() + ").";
        }

        return "Le participant (id " + registration.getParticipantId() + ") s’est désinscrit de " + eventTitle + ".";
    }

    // S'inscrire à un événement
    @PostMapping
    public ResponseEntity<Registration> register(@RequestBody Registration registration) {

        var existing = registrationRepository
                .findByEventIdAndParticipantId(registration.getEventId(), registration.getParticipantId());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        registration.setDateInscription(LocalDateTime.now());
        if (registration.getStatut() == null || registration.getStatut().isBlank()) {
            registration.setStatut("INSCRIT");
        }
        Registration saved = registrationRepository.save(registration);

        Event event = eventRepository.findById(saved.getEventId()).orElse(null);
        String eventTitle = resolveEventTitle(saved.getEventId(), event);

        // envoyer une notification au microservice notifications
        notificationClient.sendNotification(
                saved.getParticipantId(),
                saved.getEventId(),
                "CONFIRMATION_INSCRIPTION",
                "Votre inscription à " + eventTitle + " est confirmée."
        );

        // notifier l’organisateur si présent
        if (event != null && event.getOrganisateurId() != null) {
            notificationClient.sendNotification(
                    event.getOrganisateurId(),
                    saved.getEventId(),
                    "NOUVELLE_INSCRIPTION",
                    buildOrganizerRegistrationMessage(saved, event)
            );
        }

        return ResponseEntity.ok(saved);
    }

    // Se désinscrire : on supprime l'inscription
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> unregister(@PathVariable Long id) {
        var regOpt = registrationRepository.findById(id);
        if (regOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Registration reg = regOpt.get();
        registrationRepository.deleteById(id);

        Event event = eventRepository.findById(reg.getEventId()).orElse(null);
        String eventTitle = resolveEventTitle(reg.getEventId(), event);

        // envoyer une notification d'annulation au participant
        notificationClient.sendNotification(
                reg.getParticipantId(),
                reg.getEventId(),
                "ANNULATION_INSCRIPTION",
                "Votre inscription à " + eventTitle + " a été annulée."
        );

        // notifier l’organisateur si présent
        if (event != null && event.getOrganisateurId() != null) {
            notificationClient.sendNotification(
                    event.getOrganisateurId(),
                    reg.getEventId(),
                    "DESINSCRIPTION",
                    buildOrganizerUnregisterMessage(reg, event)
            );
        }

        return ResponseEntity.noContent().build();
    }

    // Liste des inscriptions pour un événement donné
    @GetMapping("/event/{eventId}")
    public List<Registration> getByEvent(@PathVariable Long eventId) {
        return registrationRepository.findByEventId(eventId);
    }

    // Liste des inscriptions d'un participant donné
    @GetMapping("/participant/{participantId}")
    public List<Registration> getByParticipant(@PathVariable Long participantId) {
        return registrationRepository.findByParticipantId(participantId);
    }
}
