package com.library.api.DTO;

import com.library.api.entity.Book;

import lombok.Data;

@Data
public class BookDTO {
    private Long id;
    private String title;
    private String author;
    private String publisher;
    private Integer publicationYear;
    private String topics;
    private Integer numberOfCopies;
    private Long schoolId; // Only include ID, not full object

    public BookDTO(Book book) {
        this.id = book.getId();
        this.title = book.getTitle();
        this.author = book.getAuthor();
        this.publisher = book.getPublisher();
        this.publicationYear = book.getPublicationYear();
        this.topics = book.getTopics();
        this.numberOfCopies = book.getNumberOfCopies();
        this.schoolId = book.getSchool() != null ? book.getSchool().getId() : null;
    }
}