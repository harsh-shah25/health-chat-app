package com.bhagya.authservice.dto;

import jakarta.validation.constraints.*;

public class SignUpRequest {
    @NotBlank private String username;
    @NotBlank private String password;
    @NotBlank private String name;
    @NotBlank @Email private String email;
    @NotNull private String role;    // "ROLE_PATIENT" or "ROLE_PROVIDER"

    private String specialization;
    private String licenseNumber;
    private String experience;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
}
