package com.restaurant.payment.api.controller;

import com.restaurant.payment.api.dto.CreatePaymentIntentRequest;
import com.restaurant.payment.api.dto.PaymentResponse;
import com.restaurant.payment.application.PaymentService;
import com.restaurant.payment.application.StripeWebhookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Gestion des paiements Stripe")
public class PaymentController {

    private final PaymentService paymentService;
    private final StripeWebhookService webhookService;

    @PostMapping("/intent")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Effectuer un PaymentIntent Stripe")
    public PaymentResponse createIntent(@Valid @RequestBody CreatePaymentIntentRequest request,
                                         @AuthenticationPrincipal Jwt jwt) {
        return paymentService.createIntent(request, UUID.fromString(jwt.getSubject()));
    }

    @PostMapping("/confirm")
    @Operation(summary = "Confirmer un paiement")
    public PaymentResponse confirm(@RequestParam UUID paymentId) {
        return paymentService.confirm(paymentId);
    }

    @PostMapping("/refund")
    @Operation(summary = "Rembourser un paiement")
    public PaymentResponse refund(@RequestParam UUID paymentId) {
        return paymentService.refund(paymentId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un paiement")
    public PaymentResponse getById(@PathVariable UUID id) {
        return paymentService.getById(id);
    }

    @GetMapping("/me/invoices")
    @Operation(summary = "Factures du client")
    public List<PaymentResponse> myInvoices(@AuthenticationPrincipal Jwt jwt) {
        return paymentService.getByUserId(UUID.fromString(jwt.getSubject()));
    }

    @PostMapping(value = "/webhooks/stripe",
                 consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Réception webhooks Stripe (signature vérifiée)")
    public void stripeWebhook(@RequestBody String payload,
                               @RequestHeader("Stripe-Signature") String signature) {
        webhookService.handleWebhook(payload, signature);
    }
}
