package com.arrayindex.kids_sync_app.service;

import com.arrayindex.kids_sync_app.service.impl.EmailServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailServiceImpl emailService;

    @Test
    public void testSendEmail() {
        // Set up the required fields in EmailServiceImpl
        ReflectionTestUtils.setField(emailService, "fromEmail", "test@example.com");
        ReflectionTestUtils.setField(emailService, "isTestMode", false);
        ReflectionTestUtils.setField(emailService, "testEmail", "test@example.com");

        // Mock the JavaMailSender behavior
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        // Test the sendEmail method
        boolean result = emailService.sendEmail(
            "test@example.com",
            "Test Email from KidSync",
            "This is a test email from the KidSync application. If you received this, the email service is working correctly!"
        );

        assertTrue(result, "Email should be sent successfully");
    }
}
