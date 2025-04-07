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
        LocalDateTime fiveMinutesFromNow = now.plusMinutes(5);
        
        List<Event> upcomingEvents = eventRepository.findByDateTimeBetween(now, fiveMinutesFromNow);
        
        log.info("Found {} events that need reminders", upcomingEvents.size());
        
        for (Event event : upcomingEvents) {
            try {
                // Only send reminders for events that have been scheduled
                if (!scheduledReminders.containsKey(event.getId())) {
                    log.info("Skipping reminder for event {} as it's not scheduled", event.getId());
                    continue;
                }

                // Find the user by email (userId is actually the email)
                User user = userRepository.findByEmail(event.getUserId())
                        .orElseThrow(() -> new RuntimeException("User not found for event: " + event.getId()));
                
                log.info("Sending reminder for event: {} to user: {}", event.getName(), user.getEmail());
                
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
    }

    @Override
    public boolean sendEventReminder(Event event, String recipientEmail) {
        return emailService.sendEventReminder(event, recipientEmail);
    }
} 