package com.projet.eventsservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projet.eventsservice.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByParticipantIdOrderByDateCreationDesc(Long participantId);
}