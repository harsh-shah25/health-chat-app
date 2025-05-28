package com.bhagya.authservice.dto;

public class UserProfile {
    private Long id;
    private String username;
    private String name;
    private String email;
    private String role;
    private String specialization;
    private String licenseNumber;
    private String experience;
        public UserProfile() {
    }

    public UserProfile(Long id, String username, String name, String email, String role) {
        this.id       = id;
        this.username = username;
        this.name     = name;
        this.email    = email;
        this.role     = role;
    }

    public UserProfile(Long id, String username, String name, String email, String role,
                       String specialization, String licenseNumber, String experience) {
                this.id       = id;
        this.username = username;
        this.name     = name;
        this.email    = email;
        this.role     = role;
        this.specialization = specialization;
        this.licenseNumber = licenseNumber;
        this.experience = experience;
    }

        public Long   getId()       { return id; }
    public String getUsername() { return username; }
    public String getName()     { return name; }
    public String getEmail()    { return email; }
    public String getRole()     { return role; }
    public void   setId(Long id){ this.id = id; }
    public void   setUsername(String u){ this.username = u; }
    public void   setName(String n){ this.name = n; }
    public void   setEmail(String e){ this.email = e; }
    public void   setRole(String r){ this.role = r; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    public String getExperience() { return experience; }
    public void setExperience(String experience) {
        this.experience = experience;
    }
                    }