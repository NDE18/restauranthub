package com.restaurant.payment.application;

import com.restaurant.payment.domain.model.Payment;
import com.restaurant.payment.domain.model.PaymentStatus;
import com.restaurant.payment.domain.repository.PaymentRepository;
import com.restaurant.payment.events.PaymentEventPublisher;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StripeWebhookService {

    private final PaymentRepository repository;
    private final PaymentEventPublisher eventPublisher;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    public void handleWebhook(String payload, String signature) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, signature, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.warn("Webhook Stripe : signature invalide");
            throw new RuntimeException("Signature webhook invalide");
        }

        switch (event.getType()) {
            case "payment_intent.succeeded" -> handlePaymentSucceeded(event);
            case "payment_intent.payment_failed" -> handlePaymentFailed(event);
            default -> log.debug("Événement Stripe ignoré : {}", event.getType());
        }
    }

    private void handlePaymentSucceeded(Event event) {
        PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject().orElseThrow();

        repository.findByStripePaymentIntentId(intent.getId()).ifPresent(payment -> {
            payment.setStatus(PaymentStatus.SUCCEEDED);
            Payment saved = repository.save(payment);
            eventPublisher.publishSucceeded(saved);
            log.info("Paiement réussi : {}", payment.getId());
        });
    }

    private void handlePaymentFailed(Event event) {
        PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject().orElseThrow();

        repository.findByStripePaymentIntentId(intent.getId()).ifPresent(payment -> {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(intent.getLastPaymentError() != null
                    ? intent.getLastPaymentError().getMessage() : "Échec paiement");
            Payment saved = repository.save(payment);
            eventPublisher.publishFailed(saved);
            log.warn("Paiement échoué : {}", payment.getId());
        });
    }
}
