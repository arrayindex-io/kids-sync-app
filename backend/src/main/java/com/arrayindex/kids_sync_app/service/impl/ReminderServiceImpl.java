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
import java.util.concurrent.ConcurrentHashMap;
import java.util.ArrayList;
import java.util.Comparator;

/**
 * Implementation of the ReminderService for managing event reminders.
 *
 * This class handles:
 * 1. Scheduling reminders for events
 * 2. Sending reminders at appropriate times before events
 * 3. Managing reminder windows (time periods before an event when reminders should be sent)
 * 4. Tracking which reminders have been sent
 *
 * The implementation uses a scheduled task that runs every minute to check for events
 * that need reminders based on configurable time windows.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderServiceImpl implements ReminderService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final ConcurrentHashMap<String, Boolean> scheduledReminders = new ConcurrentHashMap<>();

    // Track which reminders have been sent
    private final ConcurrentHashMap<String, Boolean> sentReminders = new ConcurrentHashMap<>();

    // Configurable reminder windows
    private final List<ReminderWindow> reminderWindows = new ArrayList<>();

    // Constructor block to initialize reminder windows
    {
        initializeReminderWindows();
    }

    /**
     * Initialize the reminder windows with predefined values
     */
    private void initializeReminderWindows() {
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

    /**
     * Find a user by their email address
     *
     * @param email The email address of the user
     * @param eventId The ID of the event (for error reporting)
     * @return The user with the given email address
     * @throws RuntimeException if the user is not found
     */
    private User findUserByEmail(String email, String eventId) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found for event: " + eventId));
    }

    @Override
    public void scheduleReminder(Event event) {
        log.info("Scheduling reminder for event: {}", event.getName());

        try {
            // Mark the event as having a scheduled reminder
            scheduledReminders.put(event.getId(), true);

            // Find the user (userId is actually the email)
            User user = findUserByEmail(event.getUserId(), event.getId());

            // Send the reminder immediately
            log.info("Sending immediate reminder for event: {} to user: {}", event.getName(), user.getEmail());

            if (sendEventReminder(event, user.getEmail())) {
                log.info("Reminder sent successfully for event: {}", event.getName());
                // Remove from scheduled reminders after successful sending
                scheduledReminders.remove(event.getId());
            } else {
                log.error("Failed to send reminder for event: {}", event.getName());
            }
        } catch (Exception e) {
            log.error("Failed to process reminder for event: {}", event.getName(), e);
        }
    }

    @Override
    public void cancelReminder(String eventId) {
        log.info("Canceling reminder for event: {}", eventId);
        scheduledReminders.remove(eventId);
    }

    /**
     * Generate a unique key for an event and reminder window combination
     *
     * @param eventId The ID of the event
     * @param windowKey The key of the reminder window
     * @return A unique key for the event and window combination
     */
    private String generateReminderKey(String eventId, String windowKey) {
        return eventId + "_" + windowKey;
    }

    /**
     * Process reminders for a single event
     *
     * @param event The event to process reminders for
     * @param now The current time
     */
    private void processEventReminders(Event event, LocalDateTime now) {
        try {
            // Find the user (userId is actually the email)
            User user = findUserByEmail(event.getUserId(), event.getId());

            LocalDateTime eventTime = event.getDateTime();

            // Calculate time until event
            Duration timeUntilEvent = Duration.between(now, eventTime);
            double hoursUntilEvent = timeUntilEvent.toMinutes() / 60.0;

            log.debug("Processing event: {}, Time until event: {} hours",
                    event.getName(), String.format("%.2f", hoursUntilEvent));

            // Check if event has passed
            if (eventTime.isBefore(now)) {
                log.info("Event {} has passed, removing from scheduled reminders", event.getId());
                scheduledReminders.remove(event.getId());
                return;
            }

            // Check each reminder window
            for (ReminderWindow window : reminderWindows) {
                String reminderKey = generateReminderKey(event.getId(), window.getKey());

                // Check if the event falls within this window and we haven't sent a reminder yet
                if (isInWindow(hoursUntilEvent, window) && !hasReminderBeenSent(reminderKey)) {
                    log.info("Sending {} reminder for event: {} to user: {}",
                            window.getDisplayName(), event.getName(), user.getEmail());

                    if (sendEventReminder(event, user.getEmail())) {
                        markReminderAsSent(reminderKey);
                        log.debug("Reminder marked as sent: {}", reminderKey);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to process reminders for event: {}", event.getName(), e);
        }
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

        // Process each event
        upcomingEvents.forEach(event -> processEventReminders(event, now));
    }

    @Override
    public boolean sendEventReminder(Event event, String recipientEmail) {
        log.debug("Delegating reminder sending to email service for event: {}", event.getName());
        return emailService.sendEventReminder(event, recipientEmail);
    }

    @Override
    public List<ReminderWindow> getReminderWindows() {
        // Return a defensive copy to prevent external modification
        return new ArrayList<>(reminderWindows);
    }

    /**
     * Check if an event falls within a reminder window's time range
     *
     * @param hoursUntilEvent Hours until the event starts
     * @param window The reminder window to check against
     * @return true if the event is within the window's time range
     */
    private boolean isInWindow(double hoursUntilEvent, ReminderWindow window) {
        return hoursUntilEvent <= window.getMaxDuration() &&
               hoursUntilEvent >= window.getMinDuration();
    }

    /**
     * Check if a reminder has already been sent for a specific event and window
     *
     * @param reminderKey The unique key for the event and window combination
     * @return true if the reminder has already been sent
     */
    private boolean hasReminderBeenSent(String reminderKey) {
        return sentReminders.containsKey(reminderKey);
    }

    /**
     * Mark a reminder as sent for a specific event and window
     *
     * @param reminderKey The unique key for the event and window combination
     */
    private void markReminderAsSent(String reminderKey) {
        sentReminders.put(reminderKey, true);
    }
}
