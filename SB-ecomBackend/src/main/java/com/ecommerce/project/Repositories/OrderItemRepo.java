package com.ecommerce.project.Repositories;

import com.ecommerce.project.Model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping
public interface OrderItemRepo extends JpaRepository<OrderItem, Long> {
}
