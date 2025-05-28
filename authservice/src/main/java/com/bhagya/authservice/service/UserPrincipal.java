// src/main/java/com/example/auth/service/UserPrincipal.java
package com.bhagya.authservice.service;

import com.bhagya.authservice.model.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.*;
import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {
    private Long id;
    private String username, password;
    private Collection<? extends GrantedAuthority> authorities = Collections.emptyList();

    public UserPrincipal(Long id, String username, String password) {
        this.id = id; this.username = username; this.password = password;
    }
    public static UserPrincipal create(User u) {
        return new UserPrincipal(u.getId(), u.getUsername(), u.getPassword());
    }
    public Long getId(){ return id; }

    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override public String getPassword() { return password; }
    @Override public String getUsername() { return username; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
