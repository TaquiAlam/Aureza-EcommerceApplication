package com.ecommerce.project.Controller;

import com.ecommerce.project.Payload.*;
import com.ecommerce.project.Service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody UserLoginRequest loginRequest) {
        AuthenticationResult result = authService.login(loginRequest);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, result.getJwtCookie().toString())
                .body(result.getResponse());
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registeruser(@Valid @RequestBody SignupRequest signupRequest) {
        return authService.register(signupRequest);
    }

    @GetMapping("/username")
    public String currentUserName(Authentication authentication) {
        if (authentication != null)
            return authentication.getName();
        else
            return "";
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserDetails(Authentication authentication) {
        return ResponseEntity.ok().body(authService.getCurrentUserDetails(authentication));
    }

    @PostMapping("/signout")
    public ResponseEntity<?> signoutUser() {
        ResponseCookie cookie = authService.logoutUser();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new MessageResponce("You've been signed out!"));
    }
}
