package com.projet.eventsservice.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projet.eventsservice.model.Notification;
import com.projet.eventsservice.repository.NotificationRepository;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // créer une notification (appelé par events-service)
        @PostMapping
    public Notification create(@RequestBody Notification notif) {
        if (notif.getDateCreation() == null) {
            notif.setDateCreation(LocalDateTime.now());
        }

        // On force lue à false pour une nouvelle notif
        notif.setLue(false);

        return notificationRepository.save(notif);
    }

    // liste des notifications pour un participant
    @GetMapping("/participant/{participantId}")
    public List<Notification> getByParticipant(@PathVariable Long participantId) {
        return notificationRepository.findByParticipantIdOrderByDateCreationDesc(participantId);
    }

    // marquer une notification comme lue (compatible avec front actuel)
    @PatchMapping("/{id}/lue")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return notificationRepository.findById(id)
                .map(n -> {
                    n.setLue(true);
                    return ResponseEntity.ok(notificationRepository.save(n));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // supprimer une notification
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!notificationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        notificationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
