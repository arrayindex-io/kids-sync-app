package com.arrayindex.kids_sync_app.controller;

import com.arrayindex.kids_sync_app.model.Event;
import com.arrayindex.kids_sync_app.service.EventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    private final EventService eventService;
    private static final Logger log = LoggerFactory.getLogger(EventController.class);

    @Autowired
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    /**
     * Create a new event
     * @param event The event to create
     * @return The created event
     */
    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        // Get the current user's ID from the authentication context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName(); // This will be the email of the user
        
        // Set the user ID on the event
        event.setUserId(userId);
        
        Event createdEvent = eventService.createEvent(event);
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    /**
     * Get all events for the current user
     * @return List of events
     */
    @GetMapping
    public ResponseEntity<List<Event>> getEvents() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        
        List<Event> events = eventService.getEventsByUserId(userId);
        return ResponseEntity.ok(events);
    }

    /**
     * Get a specific event by ID
     * @param id The ID of the event
     * @return The event if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEvent(@PathVariable String id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update an existing event
     * @param id The ID of the event to update
     * @param event The updated event data
     * @return The updated event
     */
    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable String id, @RequestBody Event event) {
        try {
            Event updatedEvent = eventService.updateEvent(id, event);
            return ResponseEntity.ok(updatedEvent);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete an event
     * @param id The ID of the event to delete
     * @return No content if successful
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get upcoming events for the current user
     * @return List of upcoming events
     */
    @GetMapping("/upcoming")
    public ResponseEntity<List<Event>> getUpcomingEvents() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        
        log.info("Getting upcoming events for user: {}", userId);
        List<Event> upcomingEvents = eventService.getUpcomingEvents(userId);
        log.info("Found {} upcoming events for user: {}", upcomingEvents.size(), userId);
        
        return ResponseEntity.ok(upcomingEvents);
    }

    /**
     * Get all events for the current user with detailed logging
     * @return List of all events
     */
    @GetMapping("/all")
    public ResponseEntity<List<Event>> getAllEventsWithLogging() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        
        log.info("Getting all events for user: {}", userId);
        List<Event> allEvents = eventService.getEventsByUserId(userId);
        log.info("Found {} total events for user: {}", allEvents.size(), userId);
        
        // Log each event for debugging
        for (Event event : allEvents) {
            log.info("Event: id={}, name={}, dateTime={}, userId={}, recurrence={}", 
                    event.getId(), event.getName(), event.getDateTime(), event.getUserId(), event.getRecurrence());
        }
        
        return ResponseEntity.ok(allEvents);
    }

    /**
     * Get events for the current user within a date range
     * @param start The start date (ISO format)
     * @param end The end date (ISO format)
     * @return List of events
     */
    @GetMapping("/range")
    public ResponseEntity<List<Event>> getEventsByDateRange(
            @RequestParam String start,
            @RequestParam String end) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        
        try {
            LocalDateTime startDate = LocalDateTime.parse(start);
            LocalDateTime endDate = LocalDateTime.parse(end);
            
            log.info("Getting events for user: {} between: {} and: {}", userId, startDate, endDate);
            List<Event> events = eventService.getEventsByDateRange(userId, startDate, endDate);
            
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            log.error("Error parsing date range: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get a specific event by ID with detailed logging
     * @param id The ID of the event
     * @return The event if found
     */
    @GetMapping("/{id}/details")
    public ResponseEntity<Event> getEventDetails(@PathVariable String id) {
        log.info("Getting details for event: {}", id);
        
        return eventService.getEventById(id)
                .map(event -> {
                    log.info("Event details: id={}, name={}, dateTime={}, userId={}, recurrence={}", 
                            event.getId(), event.getName(), event.getDateTime(), event.getUserId(), event.getRecurrence());
                    return ResponseEntity.ok(event);
                })
                .orElseGet(() -> {
                    log.warn("Event not found: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }
} 