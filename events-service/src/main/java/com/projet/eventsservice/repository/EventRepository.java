package com.projet.eventsservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projet.eventsservice.model.Event;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByTitreContainingIgnoreCase(String keyword);

    List<Event> findByLieuContainingIgnoreCase(String lieu);

}