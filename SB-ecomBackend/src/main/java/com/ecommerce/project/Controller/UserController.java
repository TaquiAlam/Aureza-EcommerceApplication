package com.ecommerce.project.Controller;

import com.ecommerce.project.Payload.UserProfileRequest;
import com.ecommerce.project.Payload.UserProfileResponse;
import com.ecommerce.project.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users/profile")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<UserProfileResponse> getUserProfile() {
        UserProfileResponse profile = userService.getUserProfile();
        return new ResponseEntity<>(profile, HttpStatus.OK);
    }

    @PutMapping
    public ResponseEntity<UserProfileResponse> updateUserProfile(@RequestBody UserProfileRequest request) {
        UserProfileResponse updated = userService.updateUserProfile(request);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @PostMapping("/photo")
    public ResponseEntity<UserProfileResponse> uploadProfilePhoto(@RequestParam("image") MultipartFile image) throws IOException {
        UserProfileResponse updated = userService.updateProfilePhoto(image);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }
}
