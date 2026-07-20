package com.restaurant.restaurant.api.dto;

import com.restaurant.restaurant.domain.model.RestaurantStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class RestaurantResponse {
    private UUID id;
    private String name;
    private String description;
    private String phone;
    private String email;
    private String addressLine1;
    private String city;
    private String postalCode;
    private String country;
    private Double latitude;
    private Double longitude;
    private String cuisineType;
    private Integer capacityTotal;
    private RestaurantStatus status;
    private Instant createdAt;
}
