package com.restaurant.order.api.dto;

import com.restaurant.order.domain.model.OrderType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class CreateOrderRequest {

    @NotNull
    private UUID restaurantId;

    @NotNull
    private OrderType type;

    @NotEmpty
    private List<OrderItemRequest> items;

    private String promoCode;
    private LocalDateTime pickupTime;
    private String deliveryAddress;
    private String notes;
    private String idempotencyKey;

    @Data
    public static class OrderItemRequest {
        @NotNull
        private String menuItemId;
        private String itemName;
        private int quantity;
        private BigDecimal unitPrice;
        private String notes;
    }
}
