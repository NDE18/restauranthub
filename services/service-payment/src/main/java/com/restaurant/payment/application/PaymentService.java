package com.restaurant.payment.application;

import com.restaurant.payment.api.dto.CreatePaymentIntentRequest;
import com.restaurant.payment.api.dto.PaymentResponse;
import com.restaurant.payment.domain.model.Payment;
import com.restaurant.payment.domain.model.PaymentStatus;
import com.restaurant.payment.domain.repository.PaymentRepository;
import com.restaurant.payment.events.PaymentEventPublisher;
import com.restaurant.payment.exception.PaymentNotFoundException;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentService {

    private final PaymentRepository repository;
    private final PaymentEventPublisher eventPublisher;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    public PaymentResponse createIntent(CreatePaymentIntentRequest req, UUID userId) {
        if (req.getIdempotencyKey() != null) {
            return repository.findByIdempotencyKey(req.getIdempotencyKey())
                    .map(this::toResponse)
                    .orElseGet(() -> doCreateIntent(req, userId));
        }
        return doCreateIntent(req, userId);
    }

    private PaymentResponse doCreateIntent(CreatePaymentIntentRequest req, UUID userId) {
        // En production, récupérer le montant depuis service-order via REST ou event
        BigDecimal amount = BigDecimal.valueOf(0); // Placeholder — alimenté via event order.created

        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amount.multiply(BigDecimal.valueOf(100)).longValue()) // centimes
                    .setCurrency("eur")
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true).build())
                    .putMetadata("orderId", req.getOrderId().toString())
                    .putMetadata("userId", userId.toString())
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            Payment payment = Payment.builder()
                    .orderId(req.getOrderId())
                    .userId(userId)
                    .amount(amount)
                    .stripePaymentIntentId(intent.getId())
                    .stripeClientSecret(intent.getClientSecret())
                    .idempotencyKey(req.getIdempotencyKey())
                    .build();

            return toResponse(repository.save(payment));

        } catch (StripeException e) {
            log.error("Erreur Stripe createIntent : {}", e.getMessage());
            throw new RuntimeException("Erreur création PaymentIntent", e);
        }
    }

    public PaymentResponse confirm(UUID paymentId) {
        Payment payment = repository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException(paymentId));
        payment.setStatus(PaymentStatus.SUCCEEDED);
        payment = repository.save(payment);
        eventPublisher.publishSucceeded(payment);
        return toResponse(payment);
    }

    public PaymentResponse refund(UUID paymentId) {
        Payment payment = repository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException(paymentId));

        try {
            RefundCreateParams params = RefundCreateParams.builder()
                    .setPaymentIntent(payment.getStripePaymentIntentId())
                    .build();
            Refund.create(params);

            payment.setStatus(PaymentStatus.REFUNDED);
            payment = repository.save(payment);
            eventPublisher.publishRefunded(payment);
            return toResponse(payment);

        } catch (StripeException e) {
            log.error("Erreur Stripe refund : {}", e.getMessage());
            throw new RuntimeException("Erreur remboursement", e);
        }
    }

    @Transactional(readOnly = true)
    public PaymentResponse getById(UUID id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new PaymentNotFoundException(id));
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getByUserId(UUID userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    private PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .orderId(p.getOrderId())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .status(p.getStatus())
                .clientSecret(p.getStripeClientSecret())
                .invoiceUrl(p.getInvoiceUrl())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
