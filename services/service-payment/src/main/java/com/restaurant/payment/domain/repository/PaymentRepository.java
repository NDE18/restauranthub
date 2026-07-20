package com.restaurant.payment.domain.repository;

import com.restaurant.payment.domain.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByOrderId(UUID orderId);

    Optional<Payment> findByStripePaymentIntentId(String intentId);

    Optional<Payment> findByIdempotencyKey(String key);

    List<Payment> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
