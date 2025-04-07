package com.arrayindex.kids_sync_app.service.impl;

import com.arrayindex.kids_sync_app.model.Event;
import com.arrayindex.kids_sync_app.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("h:mm a");

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final boolean isTestMode;
    private final String testEmail;

    public EmailServiceImpl(
            JavaMailSender mailSender,
            @Value("${spring.mail.username}") String fromEmail,
            @Value("${spring.profiles.active:prod}") String activeProfile,
            @Value("${resend.test.email:test@example.com}") String testEmail) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.isTestMode = "dev".equals(activeProfile) || "test".equals(activeProfile);
        this.testEmail = testEmail;
        
        log.info("EmailServiceImpl initialized with fromEmail: {}", fromEmail);
        
        if (isTestMode) {
            log.info("Test mode enabled. All emails will be sent to: {}", testEmail);
        } else {
            log.info("Production mode enabled. Emails will be sent to actual recipients.");
        }
    }

    @Override
    public boolean sendEventReminder(Event event, String recipientEmail) {
        log.info("Sending event reminder for event: {} to: {}", event.getName(), recipientEmail);
        String subject = "Reminder: " + event.getName();
        String content = formatEventReminderMessage(event);
        return sendEmail(recipientEmail, subject, content);
    }

    @Override
    public boolean sendEmail(String to, String subject, String message) {
        try {
            // Determine the actual recipient based on the mode
            String actualRecipient = isTestMode ? testEmail : to;
            
            if (isTestMode) {
                log.info("Test mode: Redirecting email from {} to {}", to, actualRecipient);
            }
            
            log.info("Attempting to send email to: {}", actualRecipient);
            log.info("Subject: {}, Message length: {}", subject, message.length());

            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(actualRecipient);
            mailMessage.setSubject(subject);
            
            // Add original recipient info only in test mode
            if (isTestMode) {
                mailMessage.setText(message + "\n\nOriginal recipient: " + to);
            } else {
                mailMessage.setText(message);
            }

            mailSender.send(mailMessage);
            
            if (isTestMode) {
                log.info("Email sent successfully to: {} (redirected from {})", actualRecipient, to);
            } else {
                log.info("Email sent successfully to: {}", actualRecipient);
            }
            
            return true;
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
            return false;
        }
    }

    private String formatEventReminderMessage(Event event) {
        return String.format(
                "Don't forget to prepare!\n\n" +
                "Event: %s\n" +
                "Date: %s\n" +
                "Time: %s\n" +
                "Notes: %s",
                event.getName(),
                event.getDateTime().toLocalDate(),
                event.getDateTime().format(TIME_FORMATTER),
                event.getNotes() != null ? event.getNotes() : "No notes"
        );
    }
} 