package com.restaurant.reservation.api.dto;

import com.restaurant.reservation.domain.model.ReservationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class ReservationResponse {
    private UUID id;
    private UUID restaurantId;
    private UUID userId;
    private LocalDate reservationDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private int guestsCount;
    private ReservationStatus status;
    private String specialRequests;
    private Instant createdAt;
}
