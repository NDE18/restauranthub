package com.restaurant.user.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String identifier) {
        super("Utilisateur introuvable : " + identifier);
    }
}
