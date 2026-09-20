package com.ecommerce.project.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Ye filter woh jagah hai jahan pichli class ke teeno methods actually use hote hain.
 * JwtUtils toolbox hai, AuthTokenFilter woh mechanic hai jo tools uthata hai — har request pe, ek baar.
 * Har incoming request ko intercept karta hai aur JWT se authentication set karta hai.

 * Chain mein position: UsernamePasswordAuthenticationFilter se pehle
 * (WebSecurityConfig mein addFilterBefore se register hota hai) — kyunki
 * hume form login se pehle token-based auth establish karni hai.
 *
 * OncePerRequestFilter kyun: internal forwards (error pages, RequestDispatcher)
 * pe plain filter dobara chal jaata hai. Ye base class request pe ek attribute
 * lagakar dohraav rok deta hai.
 *
 * Ye filter khud kabhi 401 nahi bhejta — token invalid ho to bas authentication
 * set nahi karta aur request aage bhej deta hai. Reject karna
 * authorizeHttpRequests + AuthEntryPointJwt ka kaam hai.
 */
@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    /** Token nikaalne, verify karne aur username padhne ka toolbox. */
    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Username se poora user (roles included) DB se load karta hai.
     * Zaruri hai kyunki JwtUtils token mein roles nahi daalta — sirf sub claim.
     * Trade-off: per-request DB hit, lekin role revoke turant effective.
     */
    @Autowired
    private UserDetailsService userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        logger.debug("AuthTokenFilter called for URI: {}", request.getRequestURI());

        try {
            // Step 1: header se raw token nikaalo (null ho sakta hai)
            String jwt = parseJwt(request);

            // Step 2: token hai aur valid hai? && short-circuit karta hai,
            // isliye public endpoints (jahan token nahi aata) pe
            // validateJwtToken call hi nahi hota.
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {

                // Step 3: sub claim se username. Signature already verify ho chuka,
                // isliye ye value bharose ki hai — spoof nahi ki ja sakti.
                String username = jwtUtils.getUserNameFromJwtToken(jwt);

                // Step 4: DB se authorities aur account status lao
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // Step 5: authenticated token banao.
                //   principal   = userDetails
                //   credentials = null  → JWT flow mein password involved nahi,
                //                          hash ko memory mein rakhna bekaar risk hai
                //   authorities = DB se aayi roles
                // 3-arg constructor authenticated=true set karta hai — hum keh rahe
                // hain "verification ho gayi", kyunki signature ne prove kar diya.
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());

                logger.debug("Roles from JWT: {}", userDetails.getAuthorities());

                // Step 6: IP + session ID attach karo — audit logging ke liye kaam aata hai
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                // Step 7: asli kaam. SecurityContextHolder andar se ThreadLocal use karta
                // hai, to authentication current request thread se bandh jaati hai.
                // Isi ke bharose @PreAuthorize, hasRole(), @AuthenticationPrincipal chalte hain.
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

        } catch (UsernameNotFoundException e) {
            // Token valid tha par user ab DB mein nahi hai (delete ho gaya).
            // Expected scenario, isliye alag handle kiya — infrastructure failure nahi hai.
            SecurityContextHolder.clearContext();
            logger.warn("Token valid but user not found: {}", e.getMessage());

        } catch (Exception e) {
            // FIX: pehle "Cannot set user authentication: {}", e likha tha.
            // SLF4J stack trace sirf tab print karta hai jab Throwable ke liye
            // koi placeholder na bacha ho. {} rehne se exception.toString() bhar
            // jaata tha aur stack trace gayab ho jaata tha.
            SecurityContextHolder.clearContext();
            logger.error("Cannot set user authentication", e);
        }

        // try/catch ke BAHAR — chahe auth set hui ya nahi, request aage jaati hai.
        // Bina authentication wali request ko aage authorization rules reject karengi.
        filterChain.doFilter(request, response);
    }

    /**
     * JwtUtils ke around thin wrapper, ek debug log ke saath.
     *
     * @return raw JWT, ya null agar Authorization header missing/malformed hai
     */
    private String parseJwt(HttpServletRequest request) {
        String jwt = jwtUtils.getJwtFromHeader(request);
        if (jwt == null || jwt.trim().isEmpty()) {
            jwt = jwtUtils.getJWTfromcookies(request);
        }
        logger.debug("AuthTokenFilter.java: {}", jwt);
        return jwt;
    }
}