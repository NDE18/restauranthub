package com.restaurant.order.api.dto;

import com.restaurant.order.domain.model.OrderStatus;
import com.restaurant.order.domain.model.OrderType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class OrderResponse {
    private UUID id;
    private UUID userId;
    private UUID restaurantId;
    private OrderType type;
    private OrderStatus status;
    private List<OrderItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal deliveryFee;
    private BigDecimal totalAmount;
    private Instant createdAt;

    @Data
    @Builder
    public static class OrderItemResponse {
        private String menuItemId;
        private String itemName;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}
