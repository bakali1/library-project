package com.library.api.controler;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.library.api.DTO.CreateLoanRequest;
import com.library.api.entity.Enums.BorrowStatus;
import com.library.api.models.*;
import com.library.api.servces.BookAuthService;

@RestController
@RequestMapping("/api/book")
public class BookController {
    
    private final BookAuthService bookAuthService;

    public BookController(BookAuthService bookAuthService) {
        this.bookAuthService = bookAuthService;
    }

    @PostMapping("/bookList")
    public ResponseEntity<BookResponse> getBooks(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody BookRequest request
    ) {
        return bookAuthService.getBooks(authHeader, request);
    }

    @PostMapping("/borrowsList")
    public ResponseEntity<BorrowResponse> getBorrowedBooks(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody BookRequest request
    ) {
        return bookAuthService.getBorrowedBooks(authHeader, request);
    }

    @GetMapping("/borrowsList/{status}")
    public ResponseEntity<BorrowResponse> getBorrowedBooksByStatus(
        @RequestHeader("Authorization") String authHeader,
        @RequestParam(required = false) Long schoolId,
        @PathVariable BorrowStatus status
    ) {
        return bookAuthService.getBorrowedBooksByStatus(authHeader, schoolId, status);
    }

    @PostMapping("/borrowingcreate")
    public ResponseEntity<BorrowResponse> createLoan(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody CreateLoanRequest request 
    ) {
        return bookAuthService.createLoan(authHeader, request);
    }
    @PostMapping("/return")
    public ResponseEntity<BorrowResponse> returnBook(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody returnRequest request) {
        
        // Validate borrowId exists
        if (request.getBorrowId() == null) {
            BorrowResponse response = new BorrowResponse();
            response.setSuccess(false);
            response.setMessage("Borrow ID is required");
            return ResponseEntity.badRequest().body(response);
        }
        
        return bookAuthService.returnBook(authHeader, request.getBorrowId());
    }
}