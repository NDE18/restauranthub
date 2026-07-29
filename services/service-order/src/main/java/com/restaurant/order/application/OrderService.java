package com.restaurant.order.application;

import com.restaurant.order.api.dto.CreateOrderRequest;
import com.restaurant.order.api.dto.OrderResponse;
import com.restaurant.order.domain.model.*;
import com.restaurant.order.domain.repository.OrderRepository;
import com.restaurant.order.events.OrderEventPublisher;
import com.restaurant.order.exception.OrderNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.10");

    private final OrderRepository repository;
    private final OrderEventPublisher eventPublisher;

    public OrderResponse create(CreateOrderRequest req, UUID userId) {
        if (req.getIdempotencyKey() != null) {
            return repository.findByIdempotencyKey(req.getIdempotencyKey())
                    .map(this::toResponse)
                    .orElseGet(() -> doCreate(req, userId));
        }
        return doCreate(req, userId);
    }

    private OrderResponse doCreate(CreateOrderRequest req, UUID userId) {
        Order order = Order.builder()
                .userId(userId)
                .restaurantId(req.getRestaurantId())
                .type(req.getType())
                .pickupTime(req.getPickupTime())
                .deliveryAddress(req.getDeliveryAddress())
                .notes(req.getNotes())
                .idempotencyKey(req.getIdempotencyKey())
                .build();

        List<OrderItem> items = req.getItems().stream().map(itemReq -> {
            BigDecimal total = itemReq.getUnitPrice()
                    .multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            return OrderItem.builder()
                    .order(order)
                    .menuItemId(itemReq.getMenuItemId())
                    .itemName(itemReq.getItemName())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(itemReq.getUnitPrice())
                    .totalPrice(total)
                    .notes(itemReq.getNotes())
                    .build();
        }).toList();

        order.setItems(items);

        BigDecimal subtotal = items.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = subtotal.multiply(TAX_RATE);
        BigDecimal total = subtotal.add(tax).add(order.getDeliveryFee());

        order.setSubtotal(subtotal);
        order.setTaxAmount(tax);
        order.setTotalAmount(total);

        Order saved = repository.save(order);
        eventPublisher.publishCreated(saved);

        log.info("Commande créée : {}", saved.getId());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public OrderResponse getById(UUID id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new OrderNotFoundException(id));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getByUserId(UUID userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    public OrderResponse updateStatus(UUID id, OrderStatus status) {
        Order order = repository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        order.setStatus(status);
        Order saved = repository.save(order);

        switch (status) {
            case READY -> eventPublisher.publishReady(saved);
            case COMPLETED -> eventPublisher.publishCompleted(saved);
            default -> {}
        }

        return toResponse(saved);
    }

    public void cancel(UUID id) {
        Order order = repository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        order.setStatus(OrderStatus.CANCELLED);
        repository.save(order);
        eventPublisher.publishCancelled(order);
    }

    // Saga callbacks — consommés via KafkaListener
    public void onPaymentSucceeded(UUID orderId, UUID paymentId) {
        repository.findById(orderId).ifPresent(order -> {
            order.setStatus(OrderStatus.PAID);
            order.setPaymentId(paymentId);
            repository.save(order);
            eventPublisher.publishPaid(order);
            log.info("Commande {} passée à PAID", orderId);
        });
    }

    public void onPaymentFailed(UUID orderId) {
        repository.findById(orderId).ifPresent(order -> {
            order.setStatus(OrderStatus.CANCELLED);
            repository.save(order);
            eventPublisher.publishCancelled(order);
            log.warn("Commande {} annulée suite à échec paiement", orderId);
        });
    }

    public void onDeliveryDelivered(UUID orderId) {
        repository.findById(orderId).ifPresent(order -> {
            order.setStatus(OrderStatus.COMPLETED);
            repository.save(order);
            eventPublisher.publishCompleted(order);
        });
    }

    private OrderResponse toResponse(Order o) {
        List<OrderResponse.OrderItemResponse> items = o.getItems().stream()
                .map(i -> OrderResponse.OrderItemResponse.builder()
                        .menuItemId(i.getMenuItemId())
                        .itemName(i.getItemName())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .totalPrice(i.getTotalPrice())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(o.getId())
                .userId(o.getUserId())
                .restaurantId(o.getRestaurantId())
                .type(o.getType())
                .status(o.getStatus())
                .items(items)
                .subtotal(o.getSubtotal())
                .taxAmount(o.getTaxAmount())
                .discountAmount(o.getDiscountAmount())
                .deliveryFee(o.getDeliveryFee())
                .totalAmount(o.getTotalAmount())
                .createdAt(o.getCreatedAt())
                .build();
    }

    public void toTry(){
        log.info("Successful");
    }
}
