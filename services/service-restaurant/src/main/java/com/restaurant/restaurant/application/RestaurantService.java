package com.restaurant.restaurant.application;

import com.restaurant.restaurant.api.dto.CreateRestaurantRequest;
import com.restaurant.restaurant.api.dto.RestaurantResponse;
import com.restaurant.restaurant.domain.model.Restaurant;
import com.restaurant.restaurant.domain.model.RestaurantStatus;
import com.restaurant.restaurant.domain.repository.RestaurantRepository;
import com.restaurant.restaurant.events.RestaurantEventPublisher;
import com.restaurant.restaurant.exception.RestaurantNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RestaurantService {

    private final RestaurantRepository repository;
    private final RestaurantEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public Page<RestaurantResponse> list(String city, String cuisineType, Pageable pageable) {
        if (city != null) {
            return repository.findByCityAndStatus(city, RestaurantStatus.ACTIVE, pageable)
                    .map(this::toResponse);
        }
        return repository.findByStatus(RestaurantStatus.ACTIVE, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<RestaurantResponse> findNearby(double lat, double lng, double radiusMeters) {
        return repository.findNearby(lat, lng, radiusMeters).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RestaurantResponse getById(UUID id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new RestaurantNotFoundException(id));
    }

    public RestaurantResponse create(CreateRestaurantRequest req) {
        Restaurant restaurant = Restaurant.builder()
                .name(req.getName())
                .description(req.getDescription())
                .phone(req.getPhone())
                .email(req.getEmail())
                .addressLine1(req.getAddressLine1())
                .addressLine2(req.getAddressLine2())
                .city(req.getCity())
                .postalCode(req.getPostalCode())
                .country(req.getCountry())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .cuisineType(req.getCuisineType())
                .capacityTotal(req.getCapacityTotal())
                .managerId(req.getManagerId())
                .build();

        restaurant = repository.save(restaurant);
        eventPublisher.publishCreated(restaurant);
        return toResponse(restaurant);
    }

    public RestaurantResponse update(UUID id, CreateRestaurantRequest req) {
        Restaurant restaurant = repository.findById(id)
                .orElseThrow(() -> new RestaurantNotFoundException(id));

        if (req.getName() != null) restaurant.setName(req.getName());
        if (req.getDescription() != null) restaurant.setDescription(req.getDescription());
        if (req.getPhone() != null) restaurant.setPhone(req.getPhone());
        if (req.getCity() != null) restaurant.setCity(req.getCity());
        if (req.getCapacityTotal() != null) restaurant.setCapacityTotal(req.getCapacityTotal());

        restaurant = repository.save(restaurant);
        eventPublisher.publishUpdated(restaurant);
        return toResponse(restaurant);
    }

    private RestaurantResponse toResponse(Restaurant r) {
        return RestaurantResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .description(r.getDescription())
                .phone(r.getPhone())
                .email(r.getEmail())
                .addressLine1(r.getAddressLine1())
                .city(r.getCity())
                .postalCode(r.getPostalCode())
                .country(r.getCountry())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .cuisineType(r.getCuisineType())
                .capacityTotal(r.getCapacityTotal())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
