package com.restaurant.user.api.controller;

import com.restaurant.user.api.dto.UpdateProfileRequest;
import com.restaurant.user.api.dto.UserResponse;
import com.restaurant.user.application.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Gestion du profil utilisateur")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Récupérer le profil courant")
    public UserResponse getMe(@AuthenticationPrincipal Jwt jwt) {
        return userService.getByKeycloakId(jwt.getSubject());
    }

    @PatchMapping("/me")
    @Operation(summary = "Update le profil")
    public UserResponse updateMe(@AuthenticationPrincipal Jwt jwt,
                                  @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(jwt.getSubject(), request);
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Supprimer le compte (RGPD)")
    public void deleteMe(@AuthenticationPrincipal Jwt jwt) {
        userService.deleteAccount(jwt.getSubject());
    }

    @GetMapping("/me/export")
    @Operation(summary = "Export RGPD des données personnelles")
    public Map<String, Object> exportData(@AuthenticationPrincipal Jwt jwt) {
        return userService.exportUserData(jwt.getSubject());
    }

    @PostMapping("/me/2fa/enable")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Activer la double authentification")
    public void enable2FA(@AuthenticationPrincipal Jwt jwt) {
        userService.enable2FA(jwt.getSubject());
    }
}
