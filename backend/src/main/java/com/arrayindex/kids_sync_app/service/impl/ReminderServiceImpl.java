package com.arrayindex.kids_sync_app.service.impl;

import com.arrayindex.kids_sync_app.model.Event;
import com.arrayindex.kids_sync_app.model.ReminderWindow;
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
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.ArrayList;
import java.util.Comparator;

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
    
    // Configurable reminder windows
    private final List<ReminderWindow> reminderWindows = new ArrayList<>();
    
    // Initialize reminder windows
    {
        // Add reminder windows in order from longest to shortest
        reminderWindows.add(new ReminderWindow("24h", 20, 24, true, "24 hours before"));
        reminderWindows.add(new ReminderWindow("12h", 10, 12, true, "12 hours before"));
        reminderWindows.add(new ReminderWindow("6h", 4, 6, true, "6 hours before"));
        reminderWindows.add(new ReminderWindow("4h", 2, 4, true, "4 hours before"));
        reminderWindows.add(new ReminderWindow("1h", 0.5, 1, false, "1 hour before"));
        reminderWindows.add(new ReminderWindow("5m", 0, 0.083, false, "5 minutes before"));
        
        // Sort by duration (longest first)
        reminderWindows.sort(Comparator.comparingDouble(ReminderWindow::getMaxDuration).reversed());
    }

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
                double hoursUntilEvent = timeUntilEvent.toMinutes() / 60.0;
                
                log.info("Event: {}, Time until event: {:.2f} hours", 
                        event.getName(), hoursUntilEvent);
                
                // Check each reminder window
                for (ReminderWindow window : reminderWindows) {
                    String reminderKey = event.getId() + "_" + window.getKey();
                    
                    // Check if the event falls within this window and we haven't sent a reminder yet
                    if (isInWindow(hoursUntilEvent, window) && !hasReminderBeenSent(reminderKey)) {
                        log.info("{} check PASSED for event: {}. Hours until event: {:.2f} (between {:.1f}-{:.1f} hours)", 
                                window.getKey(), event.getName(), hoursUntilEvent, 
                                window.getMinDuration(), window.getMaxDuration());
                        
                        log.info("Sending {} reminder for event: {} to user: {}", 
                                window.getKey(), event.getName(), user.getEmail());
                        
                        if (sendEventReminder(event, user.getEmail())) {
                            markReminderAsSent(reminderKey);
                        }
                    }
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
    
    @Override
    public List<ReminderWindow> getReminderWindows() {
        return new ArrayList<>(reminderWindows);
    }
    
    /**
     * Helper method to check if an event falls within a reminder window
     */
    private boolean isInWindow(double hoursUntilEvent, ReminderWindow window) {
        return hoursUntilEvent <= window.getMaxDuration() && hoursUntilEvent >= window.getMinDuration();
    }

    private boolean hasReminderBeenSent(String reminderKey) {
        return scheduledReminders.containsKey(reminderKey);
    }

    private void markReminderAsSent(String reminderKey) {
        scheduledReminders.put(reminderKey, true);
    }
} 