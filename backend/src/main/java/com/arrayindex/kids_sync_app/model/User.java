package com.arrayindex.kids_sync_app.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {
    @Id
    private String id;

    @Indexed(unique = true) // Ensure email is unique
    private String email;

    private String name;

    private String password; // Hashed
    private String whatsappNumber; // Optional, for WhatsApp reminders

    // Constructor for registration (password hashing happens in service/controller)
    public User(String email, String password, String whatsappNumber) {
        this.email = email;
        this.password = password; // Raw password initially
        this.whatsappNumber = whatsappNumber;
    }
    
    // Constructor for login request binding
    public User(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Lombok handles getters and setters
} 