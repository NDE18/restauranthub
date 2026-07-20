package com.restaurant.user.api.dto;

import com.restaurant.user.domain.model.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private UserStatus status;
    private boolean emailVerified;
    private boolean twoFaEnabled;
    private Set<String> roles;
    private Instant createdAt;
}
