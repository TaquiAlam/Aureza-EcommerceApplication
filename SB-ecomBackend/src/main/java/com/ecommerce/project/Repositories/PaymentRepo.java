package com.ecommerce.project.Repositories;

import com.ecommerce.project.Model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepo extends JpaRepository<Payment, Long> {
    Optional<Payment> findByPgPaymentId(String pgPaymentId);
}
