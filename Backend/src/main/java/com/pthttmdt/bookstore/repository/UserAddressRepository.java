package com.pthttmdt.bookstore.repository;

import com.pthttmdt.bookstore.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

    List<UserAddress> findByUserIdOrderByIsDefaultDescUpdatedAtDesc(Long userId);

    Optional<UserAddress> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserId(Long userId);

    @Modifying
    @Query("update UserAddress ua set ua.isDefault = false where ua.user.id = :userId")
    void clearDefaultByUserId(@Param("userId") Long userId);
}
