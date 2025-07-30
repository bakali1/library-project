package com.library.api.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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
@Table(name = "books") // lowercase table name convention
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title; // lowercase field name convention
    private String author;
    private String publisher;
    
    @Column(name = "publication_year")
    private Integer publicationYear; // Changed to Integer
    
    private String topics;
    private Integer numberOfCopies; // Better field name
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    @JsonBackReference 
    private School school;

    // A book can be in many borrow records (over time)
    @OneToMany(mappedBy = "book", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Borrow> borrows;
}
