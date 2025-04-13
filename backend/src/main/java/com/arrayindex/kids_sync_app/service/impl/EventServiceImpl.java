package com.arrayindex.kids_sync_app.service.impl;

import com.arrayindex.kids_sync_app.model.Event;
import com.arrayindex.kids_sync_app.repository.EventRepository;
import com.arrayindex.kids_sync_app.service.EventService;
import com.arrayindex.kids_sync_app.service.ReminderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final ReminderService reminderService;
    private static final Logger log = LoggerFactory.getLogger(EventServiceImpl.class);

    @Autowired
    public EventServiceImpl(EventRepository eventRepository, ReminderService reminderService) {
        this.eventRepository = eventRepository;
        this.reminderService = reminderService;
    }

    @Override
    public Event createEvent(Event event) {
        Event savedEvent = eventRepository.save(event);
        // Schedule a reminder for the new event
        reminderService.scheduleReminder(savedEvent);
        return savedEvent;
    }

    @Override
    public List<Event> getEventsByUserId(String userId) {
        return eventRepository.findByUserId(userId);
    }

    @Override
    public Optional<Event> getEventById(String id) {
        return eventRepository.findById(id);
    }

    @Override
    public Event updateEvent(String id, Event event) {
        if (!eventRepository.existsById(id)) {
            throw new IllegalArgumentException("Event not found with id: " + id);
        }
        
        event.setId(id);
        Event updatedEvent = eventRepository.save(event);
        
        // Update the reminder for the event
        reminderService.cancelReminder(id);
        reminderService.scheduleReminder(updatedEvent);
        
        return updatedEvent;
    }

    @Override
    public void deleteEvent(String id) {
        if (!eventRepository.existsById(id)) {
            throw new IllegalArgumentException("Event not found with id: " + id);
        }
        
        // Cancel any existing reminder
        reminderService.cancelReminder(id);
        
        eventRepository.deleteById(id);
    }

    @Override
    public List<Event> getUpcomingEvents(String userId) {
        LocalDateTime now = LocalDateTime.now();
        log.info("Finding upcoming events for user: {} after: {}", userId, now);
        
        // Get all events for the user
        List<Event> allEvents = eventRepository.findByUserId(userId);
        log.info("Found {} total events for user: {}", allEvents.size(), userId);
        
        // Filter events that are in the future
        List<Event> upcomingEvents = allEvents.stream()
                .filter(event -> event.getDateTime().isAfter(now))
                .collect(java.util.stream.Collectors.toList());
        
        log.info("Found {} upcoming events for user: {}", upcomingEvents.size(), userId);
        
        // Log each event for debugging
        for (Event event : upcomingEvents) {
            log.info("Upcoming event: id={}, name={}, dateTime={}, userId={}", 
                    event.getId(), event.getName(), event.getDateTime(), event.getUserId());
        }
        
        return upcomingEvents;
    }

    @Override
    public List<Event> getEventsByDateRange(String userId, LocalDateTime start, LocalDateTime end) {
        log.info("Finding events for user: {} between: {} and: {}", userId, start, end);
        List<Event> events = eventRepository.findByUserIdAndDateTimeBetweenOrderByDateTimeAsc(userId, start, end);
        log.info("Found {} events for user: {} in date range", events.size(), userId);
        
        // Log each event for debugging
        for (Event event : events) {
            log.info("Event in range: id={}, name={}, dateTime={}, userId={}", 
                    event.getId(), event.getName(), event.getDateTime(), event.getUserId());
        }
        
        return events;
    }

    @Override
    public void deleteAllUserEvents(String userId) {
        log.info("Deleting all events for user: {}", userId);
        List<Event> userEvents = eventRepository.findByUserId(userId);
        
        for (Event event : userEvents) {
            // Cancel any existing reminders
            reminderService.cancelReminder(event.getId());
            // Delete the event
            eventRepository.delete(event);
        }
        
        log.info("Deleted {} events for user: {}", userEvents.size(), userId);
    }
} 