package com.library.api.DTO;

import java.util.Date;

public class CreateLoanRequest {
    private Long bookId;
    private String borrowerEmail;
    private Date dueDate;

    // Getters and Setters
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    
    public String getBorrowerEmail() { return borrowerEmail; }
    public void setBorrowerEmail(String borrowerEmail) { this.borrowerEmail = borrowerEmail; }
    
    public Date getDueDate() { return dueDate; }
    public void setDueDate(Date dueDate) { this.dueDate = dueDate; }
}