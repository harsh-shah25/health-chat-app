// In groupmessagingservice/src/main/java/com/bhagya/groupmessagingservice/config/ (or your security package)
package org.bhagya.notificationservice.config; // Or your security package

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;


@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authHeader.substring(7);
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String userId = claims.getSubject(); // Or "username" depending on what you put in subject

            // Extract roles from claims (assuming they are stored as a list/array in a claim named "roles")
            @SuppressWarnings("unchecked") // Suppress warning for casting List
            List<String> roles = claims.get("roles", List.class);
            List<SimpleGrantedAuthority> authorities = roles != null ?
                    roles.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList()) :
                    List.of(new SimpleGrantedAuthority("ROLE_USER")); // Default if no roles claim

            // Create authentication token with user ID/username and authorities
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userId, // principal - can be username or user ID object
                    null,   // credentials - not needed for token-based auth
                    authorities); // authorities (roles)

            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {
            // Log the exception for debugging
            logger.error("JWT Token validation error: {}");
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}