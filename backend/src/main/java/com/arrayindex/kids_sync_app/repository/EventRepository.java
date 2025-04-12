package com.arrayindex.kids_sync_app.repository;

import com.arrayindex.kids_sync_app.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {

    /**
     * Find events for a specific user within a given time range
     * @param userId The ID of the user
     * @param start The start date
     * @param end The end date
     * @return List of events
     */
    List<Event> findByUserIdAndDateTimeBetween(String userId, LocalDateTime start, LocalDateTime end);

    /**
     * Find all events within a given time range
     * @param start The start date
     * @param end The end date
     * @return List of events
     */
    List<Event> findByDateTimeBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Find all events for a specific user
     * @param userId The ID of the user
     * @return List of events
     */
    List<Event> findByUserId(String userId);

    /**
     * Find all upcoming events for a specific user
     * @param userId The ID of the user
     * @param dateTime The current date and time
     * @return List of upcoming events
     */
    List<Event> findByUserIdAndDateTimeGreaterThan(String userId, LocalDateTime dateTime);

    /**
     * Find all events for a specific user within a date range
     * @param userId The ID of the user
     * @param start The start date
     * @param end The end date
     * @return List of events
     */
    List<Event> findByUserIdAndDateTimeBetweenOrderByDateTimeAsc(String userId, LocalDateTime start, LocalDateTime end);
} 