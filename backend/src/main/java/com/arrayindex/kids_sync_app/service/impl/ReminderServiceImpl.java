package com.arrayindex.kids_sync_app.service.impl;

import com.arrayindex.kids_sync_app.model.Event;
import com.arrayindex.kids_sync_app.repository.EventRepository;
import com.arrayindex.kids_sync_app.service.ReminderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.Executors;

/**
 * Implementation of the ReminderService
 */
@Service
public class ReminderServiceImpl implements ReminderService {

    private static final Logger logger = LoggerFactory.getLogger(ReminderServiceImpl.class);
    
    private final EventRepository eventRepository;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(5);
    private final ConcurrentHashMap<String, ScheduledFuture<?>> scheduledReminders = new ConcurrentHashMap<>();
    
    @Autowired
    public ReminderServiceImpl(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }
    
    @Override
    public void scheduleReminder(Event event) {
        // Cancel any existing reminder for this event
        cancelReminder(event.getId());
        
        // Calculate delay until the event
        LocalDateTime now = LocalDateTime.now();
        long delayInMinutes = java.time.Duration.between(now, event.getDateTime()).toMinutes();
        
        // Don't schedule if the event is in the past
        if (delayInMinutes <= 0) {
            logger.info("Event {} is in the past, not scheduling reminder", event.getId());
            return;
        }
        
        // Schedule the reminder to be sent 15 minutes before the event
        long reminderDelay = Math.max(0, delayInMinutes - 15);
        
        ScheduledFuture<?> future = scheduler.schedule(
            () -> sendReminder(event),
            reminderDelay,
            TimeUnit.MINUTES
        );
        
        scheduledReminders.put(event.getId(), future);
        logger.info("Scheduled reminder for event {} to be sent in {} minutes", event.getId(), reminderDelay);
    }
    
    @Override
    public void cancelReminder(String eventId) {
        ScheduledFuture<?> future = scheduledReminders.remove(eventId);
        if (future != null) {
            future.cancel(false);
            logger.info("Cancelled reminder for event {}", eventId);
        }
    }
    
    @Override
    public void sendReminder(Event event) {
        logger.info("Sending reminder for event: {}", event.getName());
        
        // TODO: Implement actual notification sending logic
        // This could be via email, WhatsApp, or other channels
        
        // For now, just log the reminder
        logger.info("REMINDER: Event '{}' is scheduled for {}", event.getName(), event.getDateTime());
    }
    
    @Override
    @Scheduled(fixedRate = 60000) // Run every minute
    public void processDueReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime fifteenMinutesFromNow = now.plusMinutes(15);
        
        // Find events that are due in the next 15 minutes
        List<Event> upcomingEvents = eventRepository.findByDateTimeBetween(now, fifteenMinutesFromNow);
        
        for (Event event : upcomingEvents) {
            sendReminder(event);
        }
    }
} 