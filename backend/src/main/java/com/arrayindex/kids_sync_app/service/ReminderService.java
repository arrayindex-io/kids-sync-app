package com.arrayindex.kids_sync_app.service;

import com.arrayindex.kids_sync_app.model.Event;

/**
 * Service for handling reminders for events
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
     * Send a reminder for an event
     * @param event The event to send a reminder for
     */
    void sendReminder(Event event);
    
    /**
     * Process all due reminders
     */
    void processDueReminders();
} 