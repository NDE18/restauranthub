package com.restaurant.restaurant.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateRestaurantRequest {

    @NotBlank
    private String name;

    private String description;
    private String phone;
    private String email;

    @NotBlank
    private String addressLine1;

    private String addressLine2;

    @NotBlank
    private String city;

    private String postalCode;

    @NotBlank
    private String country;

    private Double latitude;
    private Double longitude;
    private String cuisineType;
    private Integer capacityTotal;
    private UUID managerId;
}
