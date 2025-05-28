// src/main/java/com/example/auth/repository/UserRepository.java
package com.bhagya.authservice.repository;

import com.bhagya.authservice.model.User;
import com.bhagya.authservice.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepo extends JpaRepository<User, Long> {
     Optional<User> findByUsername(String username);
     boolean existsByUsername(String username);
     boolean existsByEmail(String email);
     List<User> findByRole(Role role);
}
