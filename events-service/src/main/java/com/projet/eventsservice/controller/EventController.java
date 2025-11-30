package com.projet.eventsservice.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.projet.eventsservice.model.Event;
import com.projet.eventsservice.repository.EventRepository;
import com.projet.eventsservice.service.NotificationClient;
import com.projet.eventsservice.dto.UserInfo;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    private final EventRepository eventRepository;
    private final NotificationClient notificationClient;

    public EventController(EventRepository eventRepository, NotificationClient notificationClient) {
        this.eventRepository = eventRepository;
        this.notificationClient = notificationClient;
    }

    // GET /api/events
    @GetMapping
    public List<Event> getAll() {
        return eventRepository.findAll();
    }

    // GET /api/events/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Event> getById(@PathVariable Long id) {
        return eventRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/events
    @PostMapping
    public Event create(@RequestBody Event event) {
        Event saved = eventRepository.save(event);
        notifyParticipantsOfNewEvent(saved);
        return saved;
    }

    // PUT /api/events/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Event> update(@PathVariable Long id, @RequestBody Event event) {
        return eventRepository.findById(id)
                .map(existing -> {
                    existing.setTitre(event.getTitre());
                    existing.setDescription(event.getDescription());
                    existing.setLieu(event.getLieu());
                    existing.setDateDebut(event.getDateDebut());
                    existing.setDateFin(event.getDateFin());
                    existing.setType(event.getType());
                    existing.setImageUrl(event.getImageUrl());
                    existing.setProgrammeUrl(event.getProgrammeUrl());
                    existing.setOrganisateurId(event.getOrganisateurId());
                    return ResponseEntity.ok(eventRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/events/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        eventRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/events/search?keyword=...&lieu=...&type=...&dateDebut=...&dateFin=...
    @GetMapping("/search")
    public List<Event> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String lieu,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin
    ) {
        List<Event> events = eventRepository.findAll();

        return events.stream()
                .filter(e -> {
                    if (keyword != null && !keyword.isBlank()) {
                        String k = keyword.toLowerCase();
                        if (e.getTitre() == null || !e.getTitre().toLowerCase().contains(k)) {
                            return false;
                        }
                    }
                    if (lieu != null && !lieu.isBlank()) {
                        String l = lieu.toLowerCase();
                        if (e.getLieu() == null || !e.getLieu().toLowerCase().contains(l)) {
                            return false;
                        }
                    }
                    if (type != null && !type.isBlank()) {
                        String t = type.toLowerCase();
                        if (e.getType() == null || !e.getType().toLowerCase().contains(t)) {
                            return false;
                        }
                    }
                    // dates reçues sous forme de string ISO (ex: "2025-11-18T18:00")
                    if (dateDebut != null && !dateDebut.isBlank()) {
                        var start = java.time.LocalDateTime.parse(dateDebut);
                        if (e.getDateDebut() == null || e.getDateDebut().isBefore(start)) {
                            return false;
                        }
                    }
                    if (dateFin != null && !dateFin.isBlank()) {
                        var end = java.time.LocalDateTime.parse(dateFin);
                        if (e.getDateFin() == null || e.getDateFin().isAfter(end)) {
                            return false;
                        }
                    }
                    return true;
                })
                .toList();
    }

    private void notifyParticipantsOfNewEvent(Event event) {
        List<UserInfo> participants = notificationClient.fetchParticipants();
        if (participants.isEmpty()) {
            return;
        }

        String eventTitle = event.getTitre() != null ? event.getTitre() : "un nouvel événement";
        String organiserName = null;
        if (event.getOrganisateurId() != null) {
            UserInfo organiser = notificationClient.fetchUser(event.getOrganisateurId());
            if (organiser != null && organiser.getFullName() != null) {
                organiserName = organiser.getFullName();
            }
        }

        String intro = organiserName != null
                ? "Nouvel événement publié par " + organiserName + " : "
                : "Nouvel événement publié : ";

        for (UserInfo participant : participants) {
            if (participant.getId() == null) {
                continue;
            }
            notificationClient.sendNotification(
                    participant.getId(),
                    event.getId(),
                    "NOUVEL_EVENEMENT",
                    intro + eventTitle + "."
            );
        }
    }
}
