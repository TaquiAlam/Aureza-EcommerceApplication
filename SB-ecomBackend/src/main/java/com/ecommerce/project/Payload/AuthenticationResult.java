package com.ecommerce.project.Payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseCookie;

@Data
@AllArgsConstructor
public class AuthenticationResult {
    private final UserLoginResponse response;
    private final ResponseCookie jwtCookie;
}
