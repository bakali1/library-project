package com.library.api.DTO;

import java.util.Date;

import com.library.api.entity.Borrow;
import com.library.api.entity.Enums.BorrowStatus;

import lombok.Data;

@Data
public class BorrowDTO {
    private Long id;
    private BookDTO books;
    private UserDTO user;
    private Date borrow_date;
    private Date due_date;
    private Date return_date;
    private BorrowStatus status;
    private Long school_id;

    public BorrowDTO(Borrow borrow){
        this.books = new BookDTO(borrow.getBook());
        this.user = new UserDTO(borrow.getUser());
        this.id = borrow.getId();
        this.borrow_date = borrow.getBorrowDate();
        this.return_date = borrow.getReturnDate();
        this.due_date = borrow.getDueDate();
        this.status = borrow.getStatus();
        this.school_id = borrow.getSchool().getId();
    }
}
