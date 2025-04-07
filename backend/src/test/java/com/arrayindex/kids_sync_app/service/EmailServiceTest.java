package com.arrayindex.kids_sync_app.service;

import com.arrayindex.kids_sync_app.service.impl.EmailServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@TestPropertySource(properties = {
    "resend.from.email=${RESEND_FROM_EMAIL:arrayindexio@gmail.com}",
    "resend.api.key=${RESEND_API_KEY:re_KRCgTUxY_KyEqeVAwRseao9Yo2sAL8p2k}"
})
public class EmailServiceTest {

    @Autowired
    private EmailService emailService;

    @Test
    public void testSendEmail() {
        // This test will only pass if you have valid Resend API key in your environment
        boolean result = emailService.sendEmail(
            "arrayindexio@gmail.com",
            "Test Email from KidSync",
            "This is a test email from the KidSync application. If you received this, the email service is working correctly!"
        );
        
        assertTrue(result, "Email should be sent successfully");
    }
}