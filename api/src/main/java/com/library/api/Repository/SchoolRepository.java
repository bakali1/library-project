package com.library.api.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.library.api.entity.School;

@Repository
public interface SchoolRepository extends JpaRepository<School, Long>  {
}
