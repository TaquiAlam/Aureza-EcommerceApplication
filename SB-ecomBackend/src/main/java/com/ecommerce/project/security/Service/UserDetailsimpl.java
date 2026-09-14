package com.ecommerce.project.security.Service;


import com.ecommerce.project.Model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

//Why we use this class...
/*
dekho bhai hmne phele use kiya the inbuild class"UserDetails" jo hme inbuild functions deti thi like ki .username(),
.istimeExpire() vgirah but according to need of our project we have to build our own Userservice class..
 */
@NoArgsConstructor
@Data
public class UserDetailsimpl implements UserDetails {
    //because UserDetails implements serializable class
    private static final long serialVersionUID = 1L;

    private Long id;
    private String username;
    private String email;
    @JsonIgnore
    private String password;

    private Collection<? extends GrantedAuthority> authorities;
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public UserDetailsimpl(Long id, String username, String email, String password, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    public static UserDetailsimpl build(User user) {
        /*
        User
         ↓
     getRoles()
         ↓
     Set<Role>
         ↓
    har Role = roli
         ↓
    roli.getRoleName()
         ↓
     role ka naam
         ↓
     new SimpleGrantedAuthority(...)
         */
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(roli -> new SimpleGrantedAuthority(roli.getRoleName().name()))
                .collect(Collectors.toList());

        return new UserDetailsimpl(
                user.getUserid(),
                user.getUsername(),
                user.getUseremail(),
                user.getUserpassword(),
                authorities);
    }
    @Override
    public @Nullable String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }
}
