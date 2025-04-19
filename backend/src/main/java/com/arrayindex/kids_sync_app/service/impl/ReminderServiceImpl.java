package com.arrayindex.kids_sync_app.service.impl;

import com.arrayindex.kids_sync_app.model.Event;
import com.arrayindex.kids_sync_app.model.User;
import com.arrayindex.kids_sync_app.repository.EventRepository;
import com.arrayindex.kids_sync_app.repository.UserRepository;
import com.arrayindex.kids_sync_app.service.EmailService;
import com.arrayindex.kids_sync_app.service.ReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implementation of the ReminderService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderServiceImpl implements ReminderService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final ConcurrentHashMap<String, Boolean> scheduledReminders = new ConcurrentHashMap<>();

    @Override
    public void scheduleReminder(Event event) {
        log.info("Scheduling reminder for event: {}", event.getName());
        scheduledReminders.put(event.getId(), true);
        
        // Send the reminder immediately when scheduled
        try {
            // Find the user by email (userId is actually the email)
            User user = userRepository.findByEmail(event.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found for event: " + event.getId()));
            
            log.info("Sending immediate reminder for event: {} to user: {}", event.getName(), user.getEmail());
            
            boolean sent = sendEventReminder(event, user.getEmail());
            
            if (sent) {
                log.info("Reminder sent successfully for event: {} to user: {}", event.getName(), user.getEmail());
                // Remove the reminder from scheduled reminders after sending
                scheduledReminders.remove(event.getId());
            } else {
                log.error("Failed to send reminder for event: {} to user: {}", event.getName(), user.getEmail());
            }
        } catch (Exception e) {
            log.error("Failed to send reminder for event: {} to user email: {}", event.getName(), event.getUserId(), e);
        }
    }

    @Override
    public void cancelReminder(String eventId) {
        log.info("Canceling reminder for event: {}", eventId);
        scheduledReminders.remove(eventId);
    }

    @Override
    @Scheduled(fixedRate = 60000) // Run every minute
    public void checkAndSendReminders() {
        log.info("Checking for events that need reminders...");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime twentyFourHoursFromNow = now.plusHours(24);
        
        // Get all events in the next 24 hours
        List<Event> upcomingEvents = eventRepository.findByDateTimeBetween(now, twentyFourHoursFromNow);
        
        log.info("Found {} events in the next 24 hours", upcomingEvents.size());
        
        for (Event event : upcomingEvents) {
            try {
                // Find the user by email (userId is actually the email)
                User user = userRepository.findByEmail(event.getUserId())
                        .orElseThrow(() -> new RuntimeException("User not found for event: " + event.getId()));
                
                LocalDateTime eventTime = event.getDateTime();
                Duration timeUntilEvent = Duration.between(now, eventTime);
                long hoursUntilEvent = timeUntilEvent.toHours();
                long minutesUntilEvent = timeUntilEvent.toMinutes();
                
                log.info("Event: {}, Time until event: {} hours, {} minutes", 
                        event.getName(), hoursUntilEvent, minutesUntilEvent);
                
                // Check if we've already sent a reminder for this time window
                String reminderKey = event.getId() + "_" + getReminderWindow(hoursUntilEvent, minutesUntilEvent);
                
                // Send reminders at specific intervals with proper ranges
                if (hoursUntilEvent <= 24 && hoursUntilEvent > 20 && !hasReminderBeenSent(reminderKey)) {
                    log.info("24-hour check PASSED for event: {}. Hours until event: {} (between 20-24 hours)", 
                            event.getName(), hoursUntilEvent);
                    log.info("Sending 24-hour reminder for event: {} to user: {}", event.getName(), user.getEmail());
                    if (sendEventReminder(event, user.getEmail())) {
                        markReminderAsSent(reminderKey);
                    }
                } else if (hoursUntilEvent <= 20 && hoursUntilEvent > 15) {
                    log.info("24-hour check FAILED for event: {}. Hours until event: {} (must be between 20-24 hours)", 
                            event.getName(), hoursUntilEvent);
                }
                
                if (hoursUntilEvent <= 12 && hoursUntilEvent > 10 && !hasReminderBeenSent(event.getId() + "_12h")) {
                    log.info("12-hour check PASSED for event: {}. Hours until event: {} (between 10-12 hours)", 
                            event.getName(), hoursUntilEvent);
                    log.info("Sending 12-hour reminder for event: {} to user: {}", event.getName(), user.getEmail());
                    if (sendEventReminder(event, user.getEmail())) {
                        markReminderAsSent(event.getId() + "_12h");
                    }
                } else if (hoursUntilEvent <= 10 && hoursUntilEvent > 6) {
                    log.info("12-hour check FAILED for event: {}. Hours until event: {} (must be between 10-12 hours)", 
                            event.getName(), hoursUntilEvent);
                }
                
                if (hoursUntilEvent <= 6 && hoursUntilEvent > 4 && !hasReminderBeenSent(event.getId() + "_6h")) {
                    log.info("6-hour check PASSED for event: {}. Hours until event: {} (between 4-6 hours)", 
                            event.getName(), hoursUntilEvent);
                    log.info("Sending 6-hour reminder for event: {} to user: {}", event.getName(), user.getEmail());
                    if (sendEventReminder(event, user.getEmail())) {
                        markReminderAsSent(event.getId() + "_6h");
                    }
                } else if (hoursUntilEvent <= 4 && hoursUntilEvent > 2) {
                    log.info("6-hour check FAILED for event: {}. Hours until event: {} (must be between 4-6 hours)", 
                            event.getName(), hoursUntilEvent);
                }
                
                // NEW: Add a specific window for events 2-4 hours away
                if (hoursUntilEvent <= 4 && hoursUntilEvent >= 2 && !hasReminderBeenSent(event.getId() + "_4h")) {
                    log.info("4-hour check PASSED for event: {}. Hours until event: {} (between 2-4 hours)", 
                            event.getName(), hoursUntilEvent);
                    log.info("Sending 4-hour reminder for event: {} to user: {}", event.getName(), user.getEmail());
                    if (sendEventReminder(event, user.getEmail())) {
                        markReminderAsSent(event.getId() + "_4h");
                    }
                } else if (hoursUntilEvent < 2 && hoursUntilEvent > 1) {
                    log.info("4-hour check FAILED for event: {}. Hours until event: {} (must be between 2-4 hours)", 
                            event.getName(), hoursUntilEvent);
                }
                
                if (hoursUntilEvent <= 1 && minutesUntilEvent > 30 && !hasReminderBeenSent(event.getId() + "_1h")) {
                    log.info("1-hour check PASSED for event: {}. Hours until event: {} (between 30-60 minutes)", 
                            event.getName(), hoursUntilEvent);
                    log.info("Sending 1-hour reminder for event: {} to user: {}", event.getName(), user.getEmail());
                    if (sendEventReminder(event, user.getEmail())) {
                        markReminderAsSent(event.getId() + "_1h");
                    }
                } else if (hoursUntilEvent <= 1 && minutesUntilEvent <= 30 && minutesUntilEvent > 5) {
                    log.info("1-hour check FAILED for event: {}. Minutes until event: {} (must be between 30-60 minutes)", 
                            event.getName(), minutesUntilEvent);
                }
                
                if (minutesUntilEvent <= 5 && minutesUntilEvent > 0 && !hasReminderBeenSent(event.getId() + "_5m")) {
                    log.info("5-minute check PASSED for event: {}. Minutes until event: {} (between 0-5 minutes)", 
                            event.getName(), minutesUntilEvent);
                    log.info("Sending 5-minute reminder for event: {} to user: {}", event.getName(), user.getEmail());
                    if (sendEventReminder(event, user.getEmail())) {
                        markReminderAsSent(event.getId() + "_5m");
                    }
                } else if (minutesUntilEvent <= 0) {
                    log.info("5-minute check FAILED for event: {}. Minutes until event: {} (must be between 0-5 minutes)", 
                            event.getName(), minutesUntilEvent);
                }
                
                // If the event has passed, remove it from scheduled reminders
                if (eventTime.isBefore(now)) {
                    log.info("Event {} has passed, removing from scheduled reminders", event.getId());
                    scheduledReminders.remove(event.getId());
                }
            } catch (Exception e) {
                log.error("Failed to send reminder for event: {} to user email: {}", event.getName(), event.getUserId(), e);
            }
        }
    }

    @Override
    public boolean sendEventReminder(Event event, String recipientEmail) {
        return emailService.sendEventReminder(event, recipientEmail);
    }

    /**
     * Helper method to determine which reminder window an event falls into
     */
    private String getReminderWindow(long hoursUntilEvent, long minutesUntilEvent) {
        if (hoursUntilEvent <= 24 && hoursUntilEvent > 20) return "24h";
        if (hoursUntilEvent <= 12 && hoursUntilEvent > 10) return "12h";
        if (hoursUntilEvent <= 6 && hoursUntilEvent > 4) return "6h";
        if (hoursUntilEvent <= 4 && hoursUntilEvent >= 2) return "4h";
        if (hoursUntilEvent <= 1 && minutesUntilEvent > 30) return "1h";
        if (minutesUntilEvent <= 5 && minutesUntilEvent > 0) return "5m";
        return "none";
    }

    private boolean hasReminderBeenSent(String reminderKey) {
        return scheduledReminders.containsKey(reminderKey);
    }

    private void markReminderAsSent(String reminderKey) {
        scheduledReminders.put(reminderKey, true);
    }
} 