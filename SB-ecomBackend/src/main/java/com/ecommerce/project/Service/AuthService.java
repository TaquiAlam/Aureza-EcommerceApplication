package com.ecommerce.project.Service;

import com.ecommerce.project.Payload.AuthenticationResult;
import com.ecommerce.project.Payload.SignupRequest;
import com.ecommerce.project.Payload.UserLoginRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

public interface AuthService {
    AuthenticationResult login(UserLoginRequest loginRequest);

    ResponseEntity<?> register(@Valid SignupRequest signupRequest);

    Object getCurrentUserDetails(Authentication authentication);

    ResponseCookie logoutUser();
}
