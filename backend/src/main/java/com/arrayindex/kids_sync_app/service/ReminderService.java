package com.arrayindex.kids_sync_app.service;

import com.arrayindex.kids_sync_app.model.Event;
import com.arrayindex.kids_sync_app.model.ReminderWindow;

import java.util.List;

/**
 * Service interface for managing event reminders
 */
public interface ReminderService {
    /**
     * Schedule a reminder for an event
     * @param event The event to schedule a reminder for
     */
    void scheduleReminder(Event event);

    /**
     * Cancel a reminder for an event
     * @param eventId The ID of the event
     */
    void cancelReminder(String eventId);

    /**
     * Checks for upcoming events and sends reminders
     */
    void checkAndSendReminders();

    /**
     * Sends a reminder for a specific event
     * @param event The event to send a reminder for
     * @param recipientEmail The email address to send the reminder to
     * @return true if the reminder was sent successfully, false otherwise
     */
    boolean sendEventReminder(Event event, String recipientEmail);

    /**
     * Get all configured reminder windows
     * @return List of reminder window configurations
     */
    List<ReminderWindow> getReminderWindows();
} 