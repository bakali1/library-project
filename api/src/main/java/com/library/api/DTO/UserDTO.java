package com.library.api.DTO;

import com.library.api.entity.User;
import com.library.api.entity.Enums.RolesEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor  // Required for Jackson deserialization
@AllArgsConstructor // Optional but useful
public class UserDTO {
    private Long id;
    private String userName;
    private String email;
    private String phone;
    private RolesEnum role;
    private Long schoolId;

    // Keep your existing constructor for entity conversion
    public UserDTO(User user) {
        this.id = user.getId();
        this.userName = user.getUsername();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.role = user.getRole();
        this.schoolId = user.getSchool() != null ? user.getSchool().getId() : null;
    }
}