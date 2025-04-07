package com.arrayindex.kids_sync_app.repository;

import com.arrayindex.kids_sync_app.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    // Find user by email (used for login and registration checks)
    Optional<User> findByEmail(String email);
    
    // Check if an email already exists (useful for registration)
    boolean existsByEmail(String email);
    
    // Find user by ID
    Optional<User> findById(String id);
} 