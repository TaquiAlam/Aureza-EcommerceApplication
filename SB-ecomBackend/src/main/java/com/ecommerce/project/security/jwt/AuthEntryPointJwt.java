package com.ecommerce.project.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Unauthenticated user protected endpoint hit kare to JSON 401 bhejta hai.
 *
 * Kab chalta hai (poora flow):
 *   AuthTokenFilter auth set nahi karta (token missing/expired/forged)
 *     -> request aage jaati hai
 *     -> AuthorizationFilter dekhta hai path protected hai par context khaali hai
 *     -> InsufficientAuthenticationException phenkta hai
 *     -> ExceptionTranslationFilter use pakad kar commence() bulata hai
 *
 * Ye kyun likhna pada: Spring ka default entry point login page pe redirect karta
 * hai ya browser Basic-auth popup dikhata hai. REST API ke liye dono bekaar —
 * frontend ko machine-readable JSON chahiye.
 *
 * SIRF 401 ke liye hai. Authenticated user ke paas role na ho to
 * AccessDeniedException aata hai aur AccessDeniedHandler 403 bhejta hai —
 * ye class us case mein call hi nahi hoti.
 *
 * Login pe galat password bhi yahan nahi aata — woh BadCredentialsException
 * AuthController ke andar hi catch ho jaata hai.
 *
 * Register hona zaruri hai, warna bekaar pada rahega:
 *   http.exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedHandler));
 */
@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {

    private static final Logger logger = LoggerFactory.getLogger(AuthEntryPointJwt.class);

    /**
     * FIX: pehle har request pe `new ObjectMapper()` banta tha, jo costly hai
     * (internal serializer cache + reflection setup) — aur ye class aksar
     * attack traffic pe chalti hai.
     *
     * Configured ObjectMapper thread-safe hai, isliye ek instance reuse safe hai.
     * Behtar: Spring Boot ka pehle se configured bean constructor se inject karo:
     *   private final ObjectMapper mapper;
     *   public AuthEntryPointJwt(ObjectMapper mapper) { this.mapper = mapper; }
     */
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException)
            throws IOException, ServletException {

        // FIX: pehle logger.error tha. Unauthorized request routine hai —
        // expired token, bot scan, frontend ka late refresh. error level pe
        // ye monitoring alerts trigger karta hai, aur attacker request spam
        // karke log disk bhar sakta hai. warn zyada sahi hai.
        // Asli exception message sirf log mein — client ko nahi.
        logger.warn("Unauthorized request to {}: {}",
                request.getRequestURI(), authException.getMessage());

        // Status aur headers body likhne se PEHLE set karo — response commit
        // hone ke baad headers change nahi ho sakte.
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("error", "Unauthorized");

        // FIX: authException.getMessage() client ko bhejna avoid karo.
        // Aksar harmless hota hai, par framework/custom exceptions internal
        // detail leak kar sakte hain. Generic message safer hai.
        body.put("message", "Authentication required. Please provide a valid token.");

        // getServletPath() kuch servlet mappings pe khaali aa sakta hai.
        // getRequestURI() zyada reliable hai.
        body.put("path", request.getRequestURI());
        body.put("timestamp", Instant.now().toString());

        // FIX (sabse kaam ka): expired vs missing token ka farak bhejo.
        // Frontend ke liye ye do bilkul alag cases hain —
        //   TOKEN_EXPIRED  -> refresh token se naya lo, user ko pata na chale
        //   default        -> login page pe bhejo
        // AuthTokenFilter mein ExpiredJwtException catch karte waqt
        // request.setAttribute("jwt_error", "TOKEN_EXPIRED") set karna hoga.
        Object jwtError = request.getAttribute("jwt_error");
        body.put("code", jwtError != null ? jwtError : "AUTH_REQUIRED");

        MAPPER.writeValue(response.getOutputStream(), body);
    }
}