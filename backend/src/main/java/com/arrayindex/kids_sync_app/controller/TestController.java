package com.arrayindex.kids_sync_app.controller;

import com.arrayindex.kids_sync_app.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {

    private final EmailService emailService;

    @PostMapping("/email")
    public ResponseEntity<Map<String, String>> testEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        boolean success = emailService.sendEmail(
            email,
            "Test Email from KidSync",
            "This is a test email from the KidSync application. If you received this, the email service is working correctly!"
        );

        if (success) {
            return ResponseEntity.ok(Map.of("message", "Test email sent successfully"));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to send test email"));
        }
    }
} 