package com.ecommerce.project.Service;

import com.ecommerce.project.Payload.UserProfileRequest;
import com.ecommerce.project.Payload.UserProfileResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface UserService {
    UserProfileResponse getUserProfile();
    UserProfileResponse updateUserProfile(UserProfileRequest request);
    UserProfileResponse updateProfilePhoto(MultipartFile image) throws IOException;
}
