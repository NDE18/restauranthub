package com.restaurant.order.domain.repository;

import com.restaurant.order.domain.model.Order;
import com.restaurant.order.domain.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Order> findByRestaurantIdAndStatus(UUID restaurantId, OrderStatus status);

    Optional<Order> findByIdempotencyKey(String idempotencyKey);
}
