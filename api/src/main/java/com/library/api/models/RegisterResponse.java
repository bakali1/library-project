package com.library.api.models;

import com.library.api.DTO.UserDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponse {
    private UserDTO user;
    private String token;
    private Boolean success;
    private String message;
}