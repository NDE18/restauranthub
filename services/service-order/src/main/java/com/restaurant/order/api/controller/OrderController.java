package com.restaurant.order.api.controller;

import com.restaurant.order.api.dto.CreateOrderRequest;
import com.restaurant.order.api.dto.OrderResponse;
import com.restaurant.order.application.OrderService;
import com.restaurant.order.domain.model.OrderStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Gestion des commandes")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Créer une commande (idempotente)")
    public OrderResponse create(@Valid @RequestBody CreateOrderRequest request,
                                 @AuthenticationPrincipal Jwt jwt) {
        return orderService.create(request, UUID.fromString(jwt.getSubject()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une commande")
    public OrderResponse getById(@PathVariable UUID id) {
        return orderService.getById(id);
    }

    @GetMapping("/me")
    @Operation(summary = "Historique de mes commandes")
    public List<OrderResponse> myOrders(@AuthenticationPrincipal Jwt jwt) {
        return orderService.getByUserId(UUID.fromString(jwt.getSubject()));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Mise à jour du statut (cuisine/livreur)")
    public OrderResponse updateStatus(@PathVariable UUID id,
                                       @RequestParam OrderStatus status) {
        return orderService.updateStatus(id, status);
    }

    @PostMapping("/{id}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Annuler une commande")
    public void cancel(@PathVariable UUID id) {
        orderService.cancel(id);
    }
}
