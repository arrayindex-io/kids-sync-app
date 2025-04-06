package com.arrayindex.kids_sync_app.service.impl;

import com.arrayindex.kids_sync_app.model.Event;
import com.arrayindex.kids_sync_app.repository.EventRepository;
import com.arrayindex.kids_sync_app.service.EventService;
import com.arrayindex.kids_sync_app.service.ReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final ReminderService reminderService;

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
        return eventRepository.findByUserIdAndDateTimeGreaterThan(userId, now);
    }
} 