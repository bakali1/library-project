package com.library.api.models;



import java.util.ArrayList;
import java.util.List;

import com.library.api.DTO.BorrowDTO;

import lombok.Data;

@Data
public class BorrowResponse {
    private List<BorrowDTO> borrowDTOs = new ArrayList<>();
    private Boolean success;
    private String message;
}
