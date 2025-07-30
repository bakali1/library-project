package com.library.api.models;

import com.library.api.entity.Enums.RolesEnum;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private RolesEnum role; // SUPERADMIN, ADMIN, TEACHER, STUDENT
    private Long schoolId; // Only needed if not SUPERADMIN
}