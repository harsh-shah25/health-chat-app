
package com.bhagya.authservice.controller;

import com.bhagya.authservice.model.*;
import com.bhagya.authservice.dto.*;
import com.bhagya.authservice.repository.UserRepo;
import com.bhagya.authservice.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired private AuthenticationManager authManager;
    @Autowired private UserRepo userRepo;
    @Autowired private PasswordEncoder encoder;
    @Autowired private JwtTokenProvider tokenProvider;

    @PostMapping("/signup")
    public ResponseEntity<?> register(@Valid @RequestBody SignUpRequest req) {
        try {
            logger.info("Processing registration request for username: {}", req.getUsername());
            
            if (userRepo.existsByUsername(req.getUsername())) {
                logger.warn("Registration failed - Username already taken: {}", req.getUsername());
                return ResponseEntity.badRequest().body("Username is already taken");
            }
            
            if (userRepo.existsByEmail(req.getEmail())) {
                logger.warn("Registration failed - Email already in use: {}", req.getEmail());
                return ResponseEntity.badRequest().body("Email is already in use");
            }

            // Create new user
            User user = new User();
            user.setUsername(req.getUsername());
            user.setPassword(encoder.encode(req.getPassword()));
            user.setName(req.getName());
            user.setEmail(req.getEmail().toLowerCase());
            
            try {
                user.setRole(Role.valueOf(req.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                logger.error("Invalid role provided: {}", req.getRole());
                return ResponseEntity.badRequest().body("Invalid role specified");
            }

            // Validate provider-specific fields
            if (user.getRole() == Role.ROLE_PROVIDER) {
                if (req.getSpecialization() == null || req.getLicenseNumber() == null || req.getExperience() == null) {
                    logger.warn("Registration failed - Missing provider fields for user: {}", req.getUsername());
                    return ResponseEntity.badRequest().body("Provider registration requires specialization, license number, and experience");
                }
                user.setSpecialization(req.getSpecialization());
                user.setLicenseNumber(req.getLicenseNumber());
                user.setExperience(req.getExperience());
            }

            // Save user
            userRepo.save(user);
            logger.info("Successfully registered new user: {}", req.getUsername());
            
            return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully");
            
        } catch (Exception e) {
            logger.error("Unexpected error during registration", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred during registration");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
            String jwt = tokenProvider.generateToken(auth);
            return ResponseEntity.ok(new JwtAuthenticationResponse(jwt));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }
}
