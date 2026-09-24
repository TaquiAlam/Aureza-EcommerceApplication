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
        Authentication authentication;
        try {
            authentication = authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                            loginRequest.getPassword()));
            /*
            AuthenticationManager
                  ↓
             AuthenticationProvider
                       ↓
             DaoAuthenticationProvider
                    ↓
                 UserDetailsService
                    ↓
                  Database
             */
        } catch (AuthenticationException exception) {
            Map<String, Object> map = new HashMap<>();
            map.put("message", "Bad credentials");
            map.put("status", false);
            return new ResponseEntity<Object>(map, HttpStatus.NOT_FOUND);
        }
        //Spring Security ke paas ek: security context ske andar current request ke authenticated user ki information rakhi ja sakti hai.
        SecurityContextHolder.getContext().setAuthentication(authentication);
        //current user ki details
        UserDetailsimpl userDetails = (UserDetailsimpl) authentication.getPrincipal();

        ResponseCookie JWTcookie = jwtUtils.generateJWTcookie(userDetails);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        String jwtToken = jwtUtils.generateTokenFromUsername(userDetails.getUsername());

        UserLoginResponse response = new UserLoginResponse(userDetails.getId(),
                userDetails.getUsername(), roles,userDetails.getEmail() , jwtToken);

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, JWTcookie.toString()).body(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registeruser(@Valid @RequestBody SignupRequest signupRequest){
        if(userRepository.existsByUsername(signupRequest.getUsername())){
            return ResponseEntity.badRequest().body(new MessageResponce("Username is already in use"));
        }

        if(userRepository.existsByUseremail(signupRequest.getEmail())){
            return ResponseEntity.badRequest().body(new MessageResponce("Email is already in use"));
        }

        User user=new User(
                signupRequest.getUsername(),signupRequest.getEmail(),passwordEncoder.encode(signupRequest.getPassword())
        );
        Set<String> strRoles=signupRequest.getRole();
        Set<Role> roles=new HashSet<>();
        if(strRoles==null){
            Role userRole=roleRepo.findByRoleName(AppRole.ROLE_USER)
                    .orElseThrow(()-> new RuntimeException("Error || User is not found !!"));
            roles.add(userRole);
        }else {
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

    @GetMapping("/username")
    public String currentUserName(Authentication authentication){
        if (authentication != null)
            return authentication.getName();
        else
            return "";
    }


    @GetMapping("/user")
    public ResponseEntity<?> getUserDetails(Authentication authentication){
        UserDetailsimpl userDetails = (UserDetailsimpl) authentication.getPrincipal();

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        String jwtToken = jwtUtils.generateTokenFromUsername(userDetails.getUsername());

        UserLoginResponse response = new UserLoginResponse(userDetails.getId(),
                userDetails.getUsername(), roles,userDetails.getEmail() , jwtToken);

        return ResponseEntity.ok().body(response);
    }

    @PostMapping("/signout")
    public ResponseEntity<?> signoutUser(){
        ResponseCookie cookie = jwtUtils.getCleanJwtCookie();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE,
                        cookie.toString())
                .body(new MessageResponce("You've been signed out!"));
    }
}


