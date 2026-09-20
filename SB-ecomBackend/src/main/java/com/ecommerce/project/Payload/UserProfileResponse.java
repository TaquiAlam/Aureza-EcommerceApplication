package com.ecommerce.project.Payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String username;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String bio;
    private String profileImage;
    private List<String> roles;
    private Integer addressesCount;
}
