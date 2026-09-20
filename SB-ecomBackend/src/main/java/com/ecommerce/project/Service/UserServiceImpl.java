package com.ecommerce.project.Service;

import com.ecommerce.project.Model.User;
import com.ecommerce.project.Model.UserProfile;
import com.ecommerce.project.Payload.UserProfileRequest;
import com.ecommerce.project.Payload.UserProfileResponse;
import com.ecommerce.project.Repositories.UserProfileRepository;
import com.ecommerce.project.Repositories.UserRepository;
import com.ecommerce.project.utils.AuthUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private AuthUtils authUtils;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private FileService fileService;

    @Value("${project.file}")
    private String path;    

    @Override
    public UserProfileResponse getUserProfile() {
        User user = authUtils.loggedInUser();
        UserProfile profile = userProfileRepository.findByUser_Userid(user.getUserid())
                .orElseGet(() -> {
                    UserProfile newProfile = new UserProfile();
                    newProfile.setUser(user);
                    return userProfileRepository.save(newProfile);
                });

        return mapToResponse(user, profile);
    }

    @Override
    public UserProfileResponse updateUserProfile(UserProfileRequest request) {
        User user = authUtils.loggedInUser();
        UserProfile profile = userProfileRepository.findByUser_Userid(user.getUserid())
                .orElseGet(() -> {
                    UserProfile newProfile = new UserProfile();
                    newProfile.setUser(user);
                    return newProfile;
                });

        profile.setFullName(request.getFullName());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setBio(request.getBio());

        UserProfile savedProfile = userProfileRepository.save(profile);
        return mapToResponse(user, savedProfile);
    }

    @Override
    public UserProfileResponse updateProfilePhoto(MultipartFile image) throws IOException {
        User user = authUtils.loggedInUser();
        UserProfile profile = userProfileRepository.findByUser_Userid(user.getUserid())
                .orElseGet(() -> {
                    UserProfile newProfile = new UserProfile();
                    newProfile.setUser(user);
                    return newProfile;
                });

        String fileName = fileService.uploadImage(path, image);
        profile.setProfileImage(fileName);

        UserProfile savedProfile = userProfileRepository.save(profile);
        return mapToResponse(user, savedProfile);
    }

    private UserProfileResponse mapToResponse(User user, UserProfile profile) {
        List<String> roles = user.getRoles().stream()
                .map(r -> r.getRoleName().name())
                .collect(Collectors.toList());

        int addressesCount = user.getAddresses() != null ? user.getAddresses().size() : 0;

        return new UserProfileResponse(
                user.getUsername(),
                user.getUseremail(),
                profile.getFullName(),
                profile.getPhoneNumber(),
                profile.getBio(),
                profile.getProfileImage(),
                roles,
                addressesCount
        );
    }
}
