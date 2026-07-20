package com.restaurant.payment.events;

import com.restaurant.payment.domain.model.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topics.payment-events}")
    private String topic;

    public void publishSucceeded(Payment p) {
        send("payment.succeeded", p, Map.of(
                "eventType", "payment.succeeded",
                "paymentId", p.getId(),
                "orderId", p.getOrderId(),
                "userId", p.getUserId(),
                "amount", p.getAmount(),
                "timestamp", Instant.now().toString()
        ));
    }

    public void publishFailed(Payment p) {
        send("payment.failed", p, Map.of(
                "eventType", "payment.failed",
                "paymentId", p.getId(),
                "orderId", p.getOrderId(),
                "reason", p.getFailureReason() != null ? p.getFailureReason() : "",
                "timestamp", Instant.now().toString()
        ));
    }

    public void publishRefunded(Payment p) {
        send("payment.refunded", p, Map.of(
                "eventType", "payment.refunded",
                "paymentId", p.getId(),
                "orderId", p.getOrderId(),
                "userId", p.getUserId(),
                "amount", p.getAmount(),
                "timestamp", Instant.now().toString()
        ));
    }

    private void send(String eventType, Payment p, Map<String, Object> payload) {
        kafkaTemplate.send(topic, p.getId().toString(), payload)
                .whenComplete((res, ex) -> {
                    if (ex != null) log.error("Erreur publication {} : {}", eventType, ex.getMessage());
                });
    }
}
