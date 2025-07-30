package com.library.api.models;

import java.util.List;

import com.library.api.DTO.BookDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookResponse {
    private List<BookDTO> books;
    private Boolean success;
    private String message;
}