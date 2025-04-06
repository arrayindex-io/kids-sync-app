package com.arrayindex.kids_sync_app.repository;

import com.arrayindex.kids_sync_app.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {

    // Find events for a specific user within a given time range
    List<Event> findByUserIdAndDateTimeBetween(String userId, LocalDateTime start, LocalDateTime end);

    // Find all events within a given time range (needed for initial reminder implementation)
    // Note: This needs refinement to associate events with users for targeted reminders.
    List<Event> findByDateTimeBetween(LocalDateTime start, LocalDateTime end);

    // Find events for a specific user
    List<Event> findByUserId(String userId);
} 