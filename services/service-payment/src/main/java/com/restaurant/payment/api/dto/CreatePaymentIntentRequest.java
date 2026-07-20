package com.restaurant.payment.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreatePaymentIntentRequest {

    @NotNull
    private UUID orderId;

    private String idempotencyKey;
}
