package com.ecommerce.project.Repositories;

import com.ecommerce.project.Model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepo extends JpaRepository<Order, Long> {

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
    Double getTotalRevenue();

    @Query("SELECT DISTINCT o FROM Order o JOIN o.orderItems oi JOIN oi.product p WHERE p.user.userid = ?1")
    org.springframework.data.domain.Page<Order> findOrdersBySellerId(Long sellerId, org.springframework.data.domain.Pageable pageDetails);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.orderItems oi JOIN oi.product p WHERE p.user.useremail = ?1")
    org.springframework.data.domain.Page<Order> findOrdersBySellerEmail(String email, org.springframework.data.domain.Pageable pageDetails);
}
