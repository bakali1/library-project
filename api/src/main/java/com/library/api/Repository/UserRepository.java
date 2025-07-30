package com.library.api.Repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.library.api.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username); // Changed to return Optional
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndPassword(String email, String password);
    Boolean existsByEmail(String email);
}