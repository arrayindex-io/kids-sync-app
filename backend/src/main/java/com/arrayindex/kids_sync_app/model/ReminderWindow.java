package com.arrayindex.kids_sync_app.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Model class representing a reminder window configuration
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReminderWindow {
    private String key;
    private double minDuration; // in hours
    private double maxDuration; // in hours
    private boolean isHourBased;
    private String displayName; // e.g., "24 hours before", "5 minutes before"
} 