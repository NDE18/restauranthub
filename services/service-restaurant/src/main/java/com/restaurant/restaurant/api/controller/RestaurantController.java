package com.restaurant.restaurant.api.controller;

import com.restaurant.restaurant.application.RestaurantService;
import com.restaurant.restaurant.api.dto.CreateRestaurantRequest;
import com.restaurant.restaurant.api.dto.RestaurantResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
@Tag(name = "Restaurants", description = "Gestion des établissements")
public class RestaurantController {

    private final RestaurantService restaurantService;

    @GetMapping
    @Operation(summary = "Liste paginée avec filtres")
    public Page<RestaurantResponse> list(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String cuisineType,
            Pageable pageable) {
        return restaurantService.list(city, cuisineType, pageable);
    }

    @GetMapping("/nearby")
    @Operation(summary = "Recherche géolocalisée")
    public List<RestaurantResponse> nearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5000") double radius) {
        return restaurantService.findNearby(lat, lng, radius);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un établissement")
    public RestaurantResponse getById(@PathVariable UUID id) {
        return restaurantService.getById(id);
    }

    @GetMapping("/{id}/schedule")
    @Operation(summary = "Horaires et disponibilités")
    public RestaurantResponse getSchedule(@PathVariable UUID id) {
        return restaurantService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Création d'un établissement (admin)")
    public RestaurantResponse create(@Valid @RequestBody CreateRestaurantRequest request) {
        return restaurantService.create(request);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Modification (admin/manager)")
    public RestaurantResponse update(@PathVariable UUID id,
                                      @RequestBody CreateRestaurantRequest request) {
        return restaurantService.update(id, request);
    }
}
