package com.arrayindex.kids_sync_app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileUpdateRequest {
    private String name;
    private String password;
    private String email;
    private String whatsappNumber;

}
