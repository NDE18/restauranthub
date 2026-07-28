package com.restaurant.user.application;

import com.restaurant.user.api.dto.RegisterRequest;
import com.restaurant.user.api.dto.UpdateProfileRequest;
import com.restaurant.user.api.dto.UserResponse;
import com.restaurant.user.domain.model.Role;
import com.restaurant.user.domain.model.RoleName;
import com.restaurant.user.domain.model.User;
import com.restaurant.user.domain.model.UserStatus;
import com.restaurant.user.domain.repository.UserRepository;
import com.restaurant.user.events.UserEventPublisher;
import com.restaurant.user.exception.EmailAlreadyExistsException;
import com.restaurant.user.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserEventPublisher eventPublisher;

    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .status(UserStatus.PENDING_VERIFICATION)
                .build();

        user = userRepository.save(user);
        eventPublisher.publishUserCreated(user);

        log.info("Nouvel utilisateur créé : {}", user.getId());
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getByKeycloakId(String keycloakId) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new UserNotFoundException("keycloakId=" + keycloakId));
        return toResponse(user);
    }

    public UserResponse updateProfile(String keycloakId, UpdateProfileRequest request) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new UserNotFoundException("keycloakId=" + keycloakId));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());

        user = userRepository.save(user);
        eventPublisher.publishUserUpdated(user);

        return toResponse(user);
    }

    public void deleteAccount(String keycloakId) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new UserNotFoundException("keycloakId=" + keycloakId));

        // Anonymisation RGPD
        user.setEmail("deleted_" + user.getId() + "@deleted.invalid");
        user.setFirstName("Supprimé");
        user.setLastName("Supprimé");
        user.setPhone(null);
        user.setStatus(UserStatus.DELETED);
        user.setDeletedAt(Instant.now());

        userRepository.save(user);
        eventPublisher.publishUserDeleted(user);

        log.info("Compte supprimé (RGPD) : {}", user.getId());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> exportUserData(String keycloakId) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new UserNotFoundException("keycloakId=" + keycloakId));

        return Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "createdAt", user.getCreatedAt(),
                "roles", user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet())
        );
    }

    public void enable2FA(String keycloakId) {
        User u = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new UserNotFoundException("keycloakId=" + keycloakId));
        u.setTwoFaEnabled(true);
        userRepository.save(u);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .status(user.getStatus())
                .emailVerified(user.isEmailVerified())
                .twoFaEnabled(user.isTwoFaEnabled())
                .roles(user.getRoles().stream()
                        .map(r -> r.getName().name())
                        .collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .build();
    }

    public void toCheck(){
        log.info("New update");
        log.info("Update saved");
    }
}
