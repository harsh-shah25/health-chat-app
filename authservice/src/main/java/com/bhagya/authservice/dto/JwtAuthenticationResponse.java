package com.bhagya.authservice.dto;

public class JwtAuthenticationResponse {
    private String token;
    public JwtAuthenticationResponse(String token){ this.token = token; }
    public String getToken(){ return token; }
}
