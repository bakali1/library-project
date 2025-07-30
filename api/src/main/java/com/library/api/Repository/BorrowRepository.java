package com.library.api.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.library.api.entity.Borrow;
import java.util.List;
import com.library.api.entity.Enums.BorrowStatus;

@Repository
public interface BorrowRepository extends JpaRepository<Borrow, Long> {
    
    @Query("SELECT b FROM Borrow b WHERE b.status = :status AND b.school.id = :schoolId")
    List<Borrow> findByStatusAndSchoolId(@Param("status") BorrowStatus status, @Param("schoolId") Long schoolId);
    
    List<Borrow> findByStatus(BorrowStatus status);
    
    // Additional useful query
    @Query("SELECT b FROM Borrow b WHERE b.school.id = :schoolId")
    List<Borrow> findBySchoolId(@Param("schoolId") Long schoolId);
}