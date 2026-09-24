package com.ecommerce.project.Repositories;

import com.ecommerce.project.Model.OrderItem;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepo extends JpaRepository<OrderItem, Long> {
    @Modifying
    @Transactional
    @Query("UPDATE OrderItem oi SET oi.product = null WHERE oi.product.productId = ?1")
    void disassociateProduct(Long productId);
}
