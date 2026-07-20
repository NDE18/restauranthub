package com.restaurant.restaurant.exception;

import java.util.UUID;

public class RestaurantNotFoundException extends RuntimeException {
    public RestaurantNotFoundException(UUID id) {
        super("Établissement introuvable : " + id);
    }
}
