package com.arrayindex.kids_sync_app.service;

import com.arrayindex.kids_sync_app.model.Event;

public interface EmailService {
    /**
     * Sends a reminder email for an event
     * @param event The event to send a reminder for
     * @param recipientEmail The email address to send the reminder to
     * @return true if the email was sent successfully, false otherwise
     */
    boolean sendEventReminder(Event event, String recipientEmail);

    /**
     * Sends an email
     * @param to The recipient email address
     * @param subject The email subject
     * @param message The email message
     * @return true if the email was sent successfully, false otherwise
     */
    boolean sendEmail(String to, String subject, String message);
} 