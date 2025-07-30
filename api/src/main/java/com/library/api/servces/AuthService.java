package com.library.api.servces;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.library.api.DTO.UserDTO;
import com.library.api.Repository.SchoolRepository;
import com.library.api.Repository.UserRepository;
import com.library.api.entity.User;
import com.library.api.models.LoginResponse;
import com.library.api.models.RegisterRequest;
import com.library.api.models.RegisterResponse;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SchoolRepository schoolRepository;
    private final JwtTokenUtil jwtTokenUtil;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        SchoolRepository schoolRepository,
        JwtTokenUtil jwtTokenUtil
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.schoolRepository = schoolRepository;
        this.jwtTokenUtil = jwtTokenUtil;
    }



    public ResponseEntity<RegisterResponse> register(RegisterRequest registerRequest) {
        RegisterResponse response = new RegisterResponse();
        
        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            response.setSuccess(false);
            response.setMessage("Email already exists");
            return ResponseEntity.badRequest().body(response);
        }

        // Create new user
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setPhone(registerRequest.getPhone());
        user.setRole(registerRequest.getRole());
        user.setSchool(schoolRepository.findById(registerRequest.getSchoolId())
                .orElseThrow(() -> new RuntimeException("School not found")));
        

        // Save user
        User savedUser = userRepository.save(user);
        
        // Generate JWT token
        String token = jwtTokenUtil.generateToken(savedUser);
        
        // Build response
        response.setUser(new UserDTO(savedUser));
        response.setToken(token);
        response.setSuccess(true);
        response.setMessage("User registered successfully");
        
        return ResponseEntity.ok(response);
    }



    public ResponseEntity<LoginResponse> login(String email, String password) {
    // 1. Find user by email only
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
    
    // 2. Validate password
    if (!passwordEncoder.matches(password, user.getPassword())) {
        throw new BadCredentialsException("Invalid password");
    }
    
    // 3. Generate token and return response
    String token = jwtTokenUtil.generateToken(user);
    
    LoginResponse response = new LoginResponse();
    response.setUser(new UserDTO(user));
    response.setToken(token);
    response.setSuccess("true");
    response.setMessage("Login successful");
    
    return ResponseEntity.ok(response);
    }
}