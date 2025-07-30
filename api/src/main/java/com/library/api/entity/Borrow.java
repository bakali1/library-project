package com.library.api.entity;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.library.api.entity.Enums.BorrowStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "borrows")
public class Borrow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "borrow_date")
    private Date borrowDate; // renamed for clarity
    
    @Column(name = "return_date")
    private Date returnDate; // can be null if not returned
    
    @Column(name = "due_date")
    private Date dueDate; // important for tracking
    
    @Enumerated(EnumType.STRING)
    private BorrowStatus status; // ACTIVE, RETURNED, OVERDUE
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id")
    private Book book;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school")
    @JsonBackReference 
    private School school;

}
