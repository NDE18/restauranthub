package com.restaurant.reservation.api.controller;

import com.restaurant.reservation.api.dto.CreateReservationRequest;
import com.restaurant.reservation.api.dto.ReservationResponse;
import com.restaurant.reservation.application.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
@Tag(name = "Reservations", description = "Réservation de tables")
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping("/availability")
    @Operation(summary = "Créneaux disponibles")
    public List<String> getAvailability(
            @RequestParam UUID restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam int guests) {
        return reservationService.getAvailableSlots(restaurantId, date, guests);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Créer une réservation (idempotente)")
    public ReservationResponse create(@Valid @RequestBody CreateReservationRequest request,
                                       @AuthenticationPrincipal Jwt jwt) {
        return reservationService.create(request, UUID.fromString(jwt.getSubject()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une réservation")
    public ReservationResponse getById(@PathVariable UUID id) {
        return reservationService.getById(id);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Modifier une réservation")
    public ReservationResponse update(@PathVariable UUID id,
                                       @RequestBody CreateReservationRequest request) {
        return reservationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Annuler une réservation")
    public void cancel(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        reservationService.cancel(id);
    }

    @GetMapping("/me")
    @Operation(summary = "Mes réservations")
    public List<ReservationResponse> myReservations(@AuthenticationPrincipal Jwt jwt) {
        return reservationService.getByUserId(UUID.fromString(jwt.getSubject()));
    }
}
