package com.library.api.entity;

import java.util.List;

import com.library.api.entity.Enums.RolesEnum;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
     // Ensure username is unique
    private String username; // Add this field if not present
    
    @Column(unique = true)
    private String email;
    private String phone;
    
    @ManyToOne(fetch = FetchType.LAZY)
    private School school;
    
    private String password;

    @Enumerated(EnumType.STRING)
    private RolesEnum role;
    
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Borrow> borrows;
}