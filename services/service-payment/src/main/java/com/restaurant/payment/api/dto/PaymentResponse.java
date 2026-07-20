package com.restaurant.payment.api.dto;

import com.restaurant.payment.domain.model.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class PaymentResponse {
    private UUID id;
    private UUID orderId;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private String clientSecret; // Stripe client secret pour le frontend
    private String invoiceUrl;
    private Instant createdAt;
}
