package com.arrayindex.kids_sync_app.controller;

import com.arrayindex.kids_sync_app.model.ReminderWindow;
import com.arrayindex.kids_sync_app.service.ReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for reminder-related operations
 */
@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ReminderController {

    private final ReminderService reminderService;

    /**
     * Get all configured reminder windows
     */
    @GetMapping("/windows")
    public ResponseEntity<List<ReminderWindow>> getReminderWindows() {
        return ResponseEntity.ok(reminderService.getReminderWindows());
    }
} 