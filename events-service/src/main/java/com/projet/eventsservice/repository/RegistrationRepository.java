package com.projet.eventsservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projet.eventsservice.model.Registration;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    List<Registration> findByEventId(Long eventId);

    List<Registration> findByParticipantId(Long participantId);

    Optional<Registration> findByEventIdAndParticipantId(Long eventId, Long participantId);
}