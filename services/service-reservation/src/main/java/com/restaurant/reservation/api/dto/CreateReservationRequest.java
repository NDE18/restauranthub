package com.restaurant.reservation.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class CreateReservationRequest {

    @NotNull
    private UUID restaurantId;

    @NotNull
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate reservationDate;

    @NotNull
    private LocalTime startTime;

    @Min(1)
    private int guestsCount;

    private String specialRequests;

    private String idempotencyKey;
}
