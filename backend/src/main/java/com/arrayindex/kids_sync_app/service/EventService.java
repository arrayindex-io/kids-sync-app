package com.arrayindex.kids_sync_app.service;

import com.arrayindex.kids_sync_app.model.Event;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

public interface EventService {
    
    /**
     * Create a new event
     * @param event The event to create
     * @return The created event
     */
    Event createEvent(Event event);
    
    /**
     * Get all events for a specific user
     * @param userId The ID of the user
     * @return List of events
     */
    List<Event> getEventsByUserId(String userId);
    
    /**
     * Get a specific event by ID
     * @param id The ID of the event
     * @return Optional containing the event if found
     */
    Optional<Event> getEventById(String id);
    
    /**
     * Update an existing event
     * @param id The ID of the event to update
     * @param event The updated event data
     * @return The updated event
     */
    Event updateEvent(String id, Event event);
    
    /**
     * Delete an event
     * @param id The ID of the event to delete
     */
    void deleteEvent(String id);
    
    /**
     * Get upcoming events for a user
     * @param userId The ID of the user
     * @return List of upcoming events
     */
    List<Event> getUpcomingEvents(String userId);
    
    /**
     * Get events for a user within a date range
     * @param userId The ID of the user
     * @param start The start date
     * @param end The end date
     * @return List of events
     */
    List<Event> getEventsByDateRange(String userId, LocalDateTime start, LocalDateTime end);
    
    /**
     * Delete all events for a specific user
     * @param userId The ID of the user
     */
    void deleteAllUserEvents(String userId);
} 