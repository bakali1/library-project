package com.library.api.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.library.api.entity.Book;
import com.library.api.entity.School;
@Repository
public interface BookRepository extends JpaRepository<Book, Long>{
    List<Book> findBySchool(School school);
}
