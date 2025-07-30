package com.library.api.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "School")
public class School {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    
    @OneToMany(mappedBy = "school",fetch = FetchType.LAZY)
    @JsonIgnore
    private List<User> users;
    
    @OneToMany(mappedBy = "school",fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Book> books;

    @OneToMany(mappedBy = "school")
    @JsonIgnore
    private List<Borrow> borrows;
}