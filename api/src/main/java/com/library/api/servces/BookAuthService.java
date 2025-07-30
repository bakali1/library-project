package com.library.api.servces;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.library.api.DTO.BookDTO;
import com.library.api.DTO.BorrowDTO;
import com.library.api.DTO.CreateLoanRequest;
import com.library.api.Repository.BookRepository;
import com.library.api.Repository.BorrowRepository;
import com.library.api.Repository.SchoolRepository;
import com.library.api.Repository.UserRepository;
import com.library.api.entity.Book;
import com.library.api.entity.Borrow;
import com.library.api.entity.School;
import com.library.api.entity.User;
import com.library.api.entity.Enums.BorrowStatus;
import com.library.api.entity.Enums.RolesEnum;
import com.library.api.models.BookRequest;
import com.library.api.models.BookResponse;
import com.library.api.models.BorrowResponse;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class BookAuthService {

    private final BorrowRepository borrowRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final JwtTokenUtil jwtTokenUtil;
    private final SchoolRepository schoolRepository;

    public BookAuthService(
        UserRepository userRepository,
        BookRepository bookRepository,
        BorrowRepository borrowRepository,
        SchoolRepository schoolRepository,
        JwtTokenUtil jwtTokenUtil) {
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.jwtTokenUtil = jwtTokenUtil;
        this.borrowRepository = borrowRepository;
        this.schoolRepository = schoolRepository;
    }

    public ResponseEntity<BookResponse> getBooks(String authHeader,BookRequest bookRequest) {
        BookResponse response = new BookResponse();
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setSuccess(false);
            response.setMessage("Missing or invalid Authorization header");
            return ResponseEntity.status(401).body(response);
        }
        
        String token = authHeader.substring(7);
        
        // Validate token
        if (!jwtTokenUtil.validateToken(token)) {
            response.setSuccess(false);
            response.setMessage("Invalid token");
            return ResponseEntity.status(401).body(response);
        }
        
        try {
            // Get user from token
            String email = jwtTokenUtil.getEmailFromToken(token);
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user has access to requested school
            if (user.getRole() != RolesEnum.SUPERADMIN && 
                (user.getSchool() == null || !user.getSchool().getId().equals(bookRequest.getSchool()))) {
                response.setSuccess(false);
                response.setMessage("Unauthorized access to school data");
                return ResponseEntity.status(403).body(response);
            }

            // Get books based on permissions
            List<BookDTO> books;
            if (user.getRole() == RolesEnum.SUPERADMIN && bookRequest.getSchool() == -1) {
                // Superadmin gets all books
                books = bookRepository.findAll().stream()
                    .map(BookDTO::new)
                    .collect(Collectors.toList());
            } else {
                // Others get books from their school
                books = bookRepository.findBySchool(user.getSchool()).stream()
                    .map(BookDTO::new)
                    .collect(Collectors.toList());
            }

            response.setBooks(books);
            response.setSuccess(true);
            response.setMessage("Books retrieved successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Error retrieving books: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    public ResponseEntity<BorrowResponse> getBorrowedBooks(String authHeader, BookRequest request) {
    BorrowResponse response = new BorrowResponse();

    // Validate Authorization header
    if (!isValidAuthHeader(authHeader)) {
        return buildUnauthorizedResponse(response, "Missing or invalid Authorization header");
    }

    String token = authHeader.substring(7);
    if (!jwtTokenUtil.validateToken(token)) {
        return buildUnauthorizedResponse(response, "Invalid token");
    }

    try {
        String email = jwtTokenUtil.getEmailFromToken(token);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<BorrowDTO> borrows = new ArrayList<>();
        
        if (user.getRole() == RolesEnum.SUPERADMIN) {
            if (request.getSchool() == -1) {
                borrowRepository.findAll().stream()
                    .filter(borrow -> borrow != null && borrow.getSchool() != null) // Add null checks
                    .map(BorrowDTO::new)
                    .forEach(borrows::add);
            } else {
                School school = schoolRepository.findById(request.getSchool())
                    .orElseThrow(() -> new RuntimeException("School not found"));
                school.getBorrows().stream()
                    .filter(borrow -> borrow != null && borrow.getSchool() != null) // Add null checks
                    .map(BorrowDTO::new)
                    .forEach(borrows::add);
            }
        } else {
            if (user.getSchool() == null) {
                response.setSuccess(false);
                response.setMessage("User is not associated with any school");
                return ResponseEntity.status(403).body(response);
            }
            
            user.getSchool().getBorrows().stream()
                .filter(borrow -> borrow != null && borrow.getSchool() != null) // Add null checks
                .map(BorrowDTO::new)
                .forEach(borrows::add);
        }

        response.setBorrowDTOs(borrows);
        response.setSuccess(true);
        response.setMessage("Borrowed books retrieved successfully");
        return ResponseEntity.ok(response);

    } catch (Exception e) {
        response.setSuccess(false);
        response.setMessage("Error retrieving borrowed books: " + e.getMessage());
        return ResponseEntity.status(500).body(response);
    }
}

    public ResponseEntity<BorrowResponse> getBorrowedBooksByStatus(String authHeader, Long schoolId, BorrowStatus status) {
    BorrowResponse response = new BorrowResponse();

    // Validate Authorization header
    if (!isValidAuthHeader(authHeader)) {
        return buildUnauthorizedResponse(response, "Missing or invalid Authorization header");
    }

    String token = authHeader.substring(7);
    if (!jwtTokenUtil.validateToken(token)) {
        return buildUnauthorizedResponse(response, "Invalid token");
    }

    try {
        String email = jwtTokenUtil.getEmailFromToken(token);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<BorrowDTO> borrows = fetchBorrowsByStatusAndSchool(user, schoolId, status);
        
        response.setBorrowDTOs(borrows);
        response.setSuccess(true);
        response.setMessage("Borrowed books retrieved successfully");
        return ResponseEntity.ok(response);

    } catch (RuntimeException e) {
        return buildErrorResponse(response, "Error retrieving borrowed books: " + e.getMessage());
    } catch (Exception e) {
        return buildErrorResponse(response, "Unexpected error occurred");
    }
}

    //------------------------------------
    @Transactional
    public ResponseEntity<BorrowResponse> createLoan(String authHeader, CreateLoanRequest request) {
        BorrowResponse response = new BorrowResponse();
        response.setBorrowDTOs(new ArrayList<>());
        // Validate auth header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return buildUnauthorizedResponse(response, "Missing or invalid Authorization header");
        }
        
        String token = authHeader.substring(7);
        
        try {
            // Validate token and get user
            if (!jwtTokenUtil.validateToken(token)) {
                return buildUnauthorizedResponse(response, "Invalid token");
            }
            
            String email = jwtTokenUtil.getEmailFromToken(token);
            User librarian = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Validate permissions
            if (!canCreateLoan(librarian)) {
                return buildUnauthorizedResponse(response, "Unauthorized - Only librarians can create loans");
            }
            
            // Validate request
            if (request.getBookId() == null || request.getBorrowerEmail() == null || request.getDueDate() == null) {
                response.setSuccess(false);
                response.setMessage("Missing required fields");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Find the book
            Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found"));
                
            // Find the borrower
            User borrower = userRepository.findByEmail(request.getBorrowerEmail())
                .orElseThrow(() -> new RuntimeException("Borrower not found"));
                
            // Validate school assignment
            if (!isSameSchoolOrSuperadmin(librarian, borrower)) {
                return buildUnauthorizedResponse(response, "Can only create loans for users in the same school");
            }
            
            // Check book availability
            if (book.getNumberOfCopies() <= 0) {
                response.setSuccess(false);
                response.setMessage("No available copies of this book");
                return ResponseEntity.status(400).body(response);
            }
            
            // Create and save the loan
            Borrow borrow = createNewBorrow(book, borrower, request.getDueDate(), librarian);
            book.setNumberOfCopies(book.getNumberOfCopies() - 1);
            
            borrowRepository.save(borrow);
            bookRepository.save(book);
            
            // Return success
            response.setSuccess(true);
            response.setMessage("Loan created successfully");
            response.getBorrowDTOs().add(new BorrowDTO(borrow));
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            return buildErrorResponse(response, "Error creating loan: " + e.getMessage());
        } catch (Exception e) {
            return buildErrorResponse(response, "Unexpected error: " + e.getMessage());
        }
    }

    private Borrow createNewBorrow(Book book, User borrower, Date dueDate, User librarian) {
        Borrow borrow = new Borrow();
        borrow.setBook(book);
        borrow.setUser(borrower);
        borrow.setBorrowDate(new Date());
        borrow.setDueDate(dueDate);
        borrow.setStatus(BorrowStatus.ACTIVE);
        
        // Set school - prioritize borrower's school, fall back to librarian's
        School school = borrower.getSchool() != null ? borrower.getSchool() : librarian.getSchool();
        if (school == null) {
            throw new RuntimeException("Cannot determine school for loan");
        }
        borrow.setSchool(school);
        
        return borrow;
    }

    @Transactional
public ResponseEntity<BorrowResponse> returnBook(String authHeader, Long borrowId) {
    BorrowResponse response = new BorrowResponse();
    response.setBorrowDTOs(new ArrayList<>());

    try {
        // Validate auth header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return buildUnauthorizedResponse(response, "Missing or invalid Authorization header");
        }
        
        String token = authHeader.substring(7);
        
        // Validate token
        if (!jwtTokenUtil.validateToken(token)) {
            return buildUnauthorizedResponse(response, "Invalid token");
        }
        
        // Get user
        String email = jwtTokenUtil.getEmailFromToken(token);
        User librarian = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Validate permissions
        if (!canCreateLoan(librarian)) {
            return buildUnauthorizedResponse(response, "Unauthorized - Only librarians can return books");
        }
        
        // Find the borrow record
        Borrow borrow = borrowRepository.findById(borrowId)
            .orElseThrow(() -> new RuntimeException("Borrow record not found"));
        
        // Check if already returned
        if (borrow.getStatus() == BorrowStatus.RETURNED) {
            response.setSuccess(false);
            response.setMessage("This book has already been returned");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Update the borrow record
        borrow.setReturnDate(new Date());
        borrow.setStatus(BorrowStatus.RETURNED);
        
        // Update book availability
        Book book = borrow.getBook();
        book.setNumberOfCopies(book.getNumberOfCopies() + 1);
        
        // Save changes
        borrowRepository.save(borrow);
        bookRepository.save(book);
        
        // Return success
        response.setSuccess(true);
        response.setMessage("Book returned successfully");
        response.getBorrowDTOs().add(new BorrowDTO(borrow));
        return ResponseEntity.ok(response);
        
    } catch (RuntimeException e) {
        // Log the error but don't rethrow to prevent transaction rollback
        System.err.println("Error returning book:"+ e.getMessage());
        return buildErrorResponse(response, "Error returning book: " + e.getMessage());
    }
}

    private boolean canCreateLoan(User user) {
        return user.getRole() == RolesEnum.LIBRARIAN || 
            user.getRole() == RolesEnum.SUPERADMIN || user.getRole() ==RolesEnum.ADMIN;
    }

    private boolean isSameSchoolOrSuperadmin(User librarian, User borrower) {
        return librarian.getRole() == RolesEnum.SUPERADMIN ||
            (librarian.getSchool() != null && 
                borrower.getSchool() != null &&
                librarian.getSchool().getId().equals(borrower.getSchool().getId()));
    }

    // Helper methods
    private boolean isValidAuthHeader(String authHeader) {
        return authHeader != null && authHeader.startsWith("Bearer ");
    }

    private ResponseEntity<BorrowResponse> buildUnauthorizedResponse(BorrowResponse response, String message) {
        response.setSuccess(false);
        response.setMessage(message);
        return ResponseEntity.status(401).body(response);
    }

    private ResponseEntity<BorrowResponse> buildErrorResponse(BorrowResponse response, String message) {
        response.setSuccess(false);
        response.setMessage(message);
        return ResponseEntity.status(500).body(response);
    }

    private List<BorrowDTO> fetchBorrowsByStatusAndSchool(User user, Long requestedSchoolId, BorrowStatus status) {
        if (user.getRole() == RolesEnum.SUPERADMIN) {
            return handleSuperadminRequest(requestedSchoolId, status);
        }
        return handleRegularUserRequest(user, status);
    }

    private List<BorrowDTO> handleSuperadminRequest(Long schoolId, BorrowStatus status) {
        if (schoolId == -1) {
            return borrowRepository.findByStatus(status).stream()
                .map(BorrowDTO::new)
                .collect(Collectors.toList());
        }
        return borrowRepository.findByStatusAndSchoolId(status, schoolId).stream()
            .map(BorrowDTO::new)
            .collect(Collectors.toList());
    }

    private List<BorrowDTO> handleRegularUserRequest(User user, BorrowStatus status) {
        if (user.getSchool() == null) {
            throw new RuntimeException("User is not associated with any school");
        }
        return borrowRepository.findByStatusAndSchoolId(status, user.getSchool().getId()).stream()
            .map(BorrowDTO::new)
            .collect(Collectors.toList());
    }
}