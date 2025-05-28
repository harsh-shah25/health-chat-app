// src/main/java/com/example/auth/service/CustomUserDetailsService.java
package com.bhagya.authservice.service;

import com.bhagya.authservice.model.User;
import com.bhagya.authservice.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired private UserRepo repo;

    @Override
    public org.springframework.security.core.userdetails.UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User u = repo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return UserPrincipal.create(u);
    }

    public UserPrincipal loadUserById(Long id) {
        User u = repo.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return UserPrincipal.create(u);
    }
}
