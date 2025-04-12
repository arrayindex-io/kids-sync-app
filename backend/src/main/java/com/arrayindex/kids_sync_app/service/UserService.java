package com.arrayindex.kids_sync_app.service;

import com.arrayindex.kids_sync_app.controller.AuthController.UserProfileUpdateRequest;
import com.arrayindex.kids_sync_app.model.User;

public interface UserService {

    String registerUser(User user);

    String loginUser(String email, String password);

    User updateProfile(String email, UserProfileUpdateRequest updateRequest);
}