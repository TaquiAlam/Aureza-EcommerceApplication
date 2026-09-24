package com.ecommerce.project.Service;

import com.ecommerce.project.Model.AppRole;
import com.ecommerce.project.Model.Role;
import com.ecommerce.project.Model.User;
import com.ecommerce.project.Payload.*;
import com.ecommerce.project.Repositories.RoleRepo;
import com.ecommerce.project.Repositories.UserRepository;
import com.ecommerce.project.security.Service.UserDetailsimpl;
import com.ecommerce.project.security.jwt.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthServiceimpl implements AuthService {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepo roleRepo;


    @Override
    public AuthenticationResult login(UserLoginRequest loginRequest) {
        Authentication authentication = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetailsimpl userDetails = (UserDetailsimpl) authentication.getPrincipal();

        ResponseCookie jwtCookie = jwtUtils.generateJWTcookie(userDetails);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        String jwtToken = jwtUtils.generateTokenFromUsername(userDetails.getUsername());

        UserLoginResponse response = new UserLoginResponse(userDetails.getId(),
                userDetails.getUsername(), roles, userDetails.getEmail(), jwtToken);

        return new AuthenticationResult(response, jwtCookie);
    }

    @Override
    public ResponseEntity<?> register(SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponce("Error: Username is already taken!"));
        }

        if (userRepository.existsByUseremail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponce("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User(signupRequest.getUsername(),
                signupRequest.getEmail(),
                passwordEncoder.encode(signupRequest.getPassword()));

        Set<String> strRoles = signupRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = roleRepo.findByRoleName(AppRole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepo.findByRoleName(AppRole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);

                        break;
                    case "seller":
                        Role modRole = roleRepo.findByRoleName(AppRole.ROLE_SELLER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(modRole);

                        break;
                    default:
                        Role userRole = roleRepo.findByRoleName(AppRole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponce("User registered successfully!"));
    }

    @Override
    public Object getCurrentUserDetails(Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        UserDetailsimpl userDetails = (UserDetailsimpl) authentication.getPrincipal();

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        UserLoginResponse response = new UserLoginResponse(userDetails.getId(),
                userDetails.getUsername(), roles);

        return response;
    }

    @Override
    public ResponseCookie logoutUser() {
        return jwtUtils.getCleanJwtCookie();
    }
}
