package com.arrayindex.kids_sync_app.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Represents an event in the system
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "events")
public class Event {

    @Id
    private String id;

    /**
     * The name of the event
     */
    private String name;

    /**
     * The date and time of the event
     */
    private LocalDateTime dateTime;

    /**
     * The ID of the user who created the event
     */
    private String userId;

    /**
     * The recurrence pattern of the event (e.g., "DAILY", "WEEKLY", "MONTHLY", "NONE")
     */
    private String recurrence;

    /**
     * The end date of the recurrence (if applicable)
     */
    private LocalDateTime recurrenceEndDate;

    /**
     * Additional notes about the event
     */
    private String notes;

    /**
     * Whether the event has been completed
     */
    private boolean completed = false;

    /**
     * Constructor for creating a new event
     * @param userId The ID of the user creating the event
     * @param name The name of the event
     * @param dateTime The date and time of the event
     * @param notes Additional notes about the event
     */
    public Event(String userId, String name, LocalDateTime dateTime, String notes) {
        this.userId = userId;
        this.name = name;
        this.dateTime = dateTime;
        this.notes = notes;
        this.recurrence = "NONE";
        this.completed = false;
    }
} 