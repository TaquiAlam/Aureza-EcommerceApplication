package com.ecommerce.project.security.jwt;


import com.ecommerce.project.security.Service.UserDetailsimpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;

/*   JWT TOken ke bare mai kuch gyaan
JWT ek string hoti hai teen hisson mein, dot se alag: header.payload.signature.
Header batata hai kaunsa algorithm use hua, payload mein claims hote hain (jaise username, issue time, expiry),
aur signature server ki secret key se banaya gaya cryptographic proof hai.

Asli baat samajhne wali: payload encrypted nahi hota,
 sirf Base64 encoded hota hai. Koi bhi use decode kar ke padh sakta hai.
 Signature sirf ye guarantee deta hai ki content badla nahi gaya.
  Isiliye JWT payload mein kabhi password ya sensitive data nahi daalte.
 */

/*
Request ka flow aisa chalta hai:
 user login karta hai →
 tum "generateTokenFromUsername" se token banate ho →
 client use store karta hai →
 aage har request mein Authorization: Bearer <token> header bhejta hai →
 tumhara filter "getJwtFromHeader" se token nikaalta hai →
 "validateJwtToken" se verify karta hai →
 "getUserNameFromJwtToken" se username nikaalta hai →
 username se user load karke SecurityContext set hota hai. Ye class un saare steps ka toolbox hai.
 */
@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);
    /**
     * Base64-encoded secret jisse token sign hota hai.
     * application.properties se aata hai — code mein hardcode nahi karna.
     * HS256 ke liye decode hone ke baad kam se kam 32 bytes hona chahiye,
     * warna jjwt WeakKeyException phenkega.
     */
    @Value("${spring.app.jwtSecret}")
    private String jwtSecret;

    @Value("${spring.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    @Value("${spring.app.jwtcookie}")
    private String jwtcookie;
    /*
    Kaam sirf ek: incoming HTTP request ke Authorization header se raw token nikaalna.
    Header ki value hoti hai Bearer eyJhbGci... — Bearer  prefix 7 characters ka hai (space included),
    isliye substring(7) se prefix hata kar sirf token bachta hai.
    Header missing ho ya Bearer  se shuru na ho to null return hota hai.
    Yahi wajah hai ki caller ko null check karna zaroori hai.
     */
    public String getJwtFromHeader(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        logger.debug("Authorization Header: {}", bearerToken);
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // Remove Bearer prefix
        }
        return null;
    }

    /*
    Dekho bhai hm ab tak header mai tokens send and recieve kr rhe the but we want ki hamara browser yaad rakhe ki hamra
      JWT token kya hai..to hm istemal krte hain cookies ka .
     */
    //this method extract jwt token from the browser cookie
     public String getJWTfromcookies(HttpServletRequest httpServletRequest) {
         Cookie cookie= WebUtils.getCookie(httpServletRequest,jwtcookie);
         if(cookie!=null){
             return cookie.getValue();
         }else {
             return null;
         }
     }

    //ye function jwt cookie banaegi
    public ResponseCookie generateJWTcookie(UserDetailsimpl userDetailsimpl) {
       String jwt=generateTokenFromUsername(userDetailsimpl.getUsername());
       ResponseCookie cookie=ResponseCookie.from(jwtcookie,jwt).path("/api")
               .maxAge(24*60*60)
               .httpOnly(true)
               .secure(true)
               .sameSite("None")
               .build();
       return cookie;
    }

     /*
      * Authenticated user ke liye naya signed JWT banata hai.
      * Ye successful login ke baad call hota hai.
      *
      * Token mein ye claims jaate hain:
      *   sub — username (kiska token hai)
      *   iat — issued-at, kab bana
      *   exp — expiry time, jiske baad token invalid
      *
      * Note: roles token mein nahi daale gaye. Isliye har request pe
      * authorities DB se load hongi (stateless kam, security zyada).
      *
      * @param userDetails Spring Security ka authenticated user (sirf username use hota hai)
      * @return compact JWT string — header.payload.signature
      */

    public String generateTokenFromUsername(String username) {
     //   String username = userDetails.getUsername();  when we generate jwt without cookie
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key())
                .compact();
    }

    /*
     * Token se username (sub claim) nikaalta hai.
     *
     * Order important hai: pehle verifyWith() signature check karta hai,
     * uske baad hi claims milte hain. Signature galat ho to exception aayega,
     * chup-chaap galat username nahi milega.
     *
     * Isliye ise call karne se pehle validateJwtToken() chalao,
     * warna exception handle karna padega.
     *
     * @param token raw JWT (bina "Bearer " prefix ke)
     * @return token ke andar ka username
     * @throws JwtException agar token invalid, expired ya tampered hai
     */
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) key())
                .build().parseSignedClaims(token)
                .getPayload().getSubject();
    }
//this method is use for clean cookie such that user can logout...
    public ResponseCookie getCleanJwtCookie() {
        ResponseCookie cookie = ResponseCookie.from(jwtcookie, "")
                .path("/api")
                .maxAge(0)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .build();
        return cookie;
    }
   /*
    * Base64 secret ko HMAC-SHA SecretKey object mein badalta hai.
    * Signing aur verification, dono isi key ko use karte hain (symmetric algorithm).
    *
    * Return type SecretKey rakha hai (pehle Key tha), isse caller mein
    * har baar cast karne ki zarurat khatam ho jaati hai.
    */
    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public boolean validateJwtToken(String authToken) {
        try {
            System.out.println("Validate");
            Jwts.parser().verifyWith((SecretKey) key()).build().parseSignedClaims(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
}

