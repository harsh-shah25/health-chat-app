package com.bhagya.authservice.controller;

import com.bhagya.authservice.model.User;
import com.bhagya.authservice.model.Role;
import com.bhagya.authservice.dto.UserProfile;
import com.bhagya.authservice.repository.UserRepo;
import com.bhagya.authservice.service.UserPrincipal;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepo userRepo;

    public UserController(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping("/providers")
    public ResponseEntity<List<UserProfile>> getAllProviders() {
        List<User> providers = userRepo.findByRole(Role.ROLE_PROVIDER);
        List<UserProfile> profiles = providers.stream()
            .map(user -> new UserProfile(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getSpecialization(),
                user.getLicenseNumber(),
                user.getExperience()
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(profiles);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        User user = userRepo.findById(principal.getId())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        UserProfile profile;
        if (user.getRole() == Role.ROLE_PROVIDER) {
            profile = new UserProfile(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getSpecialization(),
                user.getLicenseNumber(),
                user.getExperience()
            );
        } else {
            profile = new UserProfile(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
            );
        }

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody UserProfile incoming) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();

        User user = userRepo.findById(principal.getId())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        String newEmail = incoming.getEmail().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(newEmail)
                && userRepo.existsByEmail(newEmail)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Email is already in use by another account");
        }

        user.setName(incoming.getName());
        user.setEmail(newEmail);
        userRepo.save(user);

        UserProfile updated = new UserProfile(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfile> getUserById(@PathVariable Long userId) {
        return userRepo.findById(userId)
                .map(user -> {
                    UserProfile profile;
                    if (user.getRole() == Role.ROLE_PROVIDER) {
                        profile = new UserProfile(
                                user.getId(),
                                user.getUsername(),
                                user.getName(),
                                user.getEmail(),
                                user.getRole().name(),
                                user.getSpecialization(),
                                user.getLicenseNumber(),
                                String.valueOf(user.getExperience())
                        );
                    } else {
                        profile = new UserProfile(
                                user.getId(),
                                user.getUsername(),
                                user.getName(),
                                user.getEmail(),
                                user.getRole().name()

                        );
                    }
                    return ResponseEntity.ok(profile);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }
}
