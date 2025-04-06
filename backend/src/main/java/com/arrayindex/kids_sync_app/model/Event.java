package com.arrayindex.kids_sync_app.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "events")
@Data // Includes @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor
@NoArgsConstructor
public class Event {
    @Id
    private String id;
    private String userId; // To associate event with a user
    private String name;
    private LocalDateTime dateTime; // Combined date and time
    private String location; // Optional
    // private Recurrence recurrence; // TODO: Define Recurrence enum/class later
    // private String child; // TODO: Decide how to associate with child(ren) later

    public Event(String userId, String name, LocalDateTime dateTime, String location) {
        this.userId = userId;
        this.name = name;
        this.dateTime = dateTime;
        this.location = location;
    }
} 