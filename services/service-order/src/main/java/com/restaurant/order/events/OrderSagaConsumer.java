package com.restaurant.order.events;

import com.restaurant.order.application.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

/**
 * Consomme les événements des autres services pour orchestrer la Saga
 * order → payment → delivery
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderSagaConsumer {

    private final OrderService orderService;

    @KafkaListener(topics = "${kafka.consumer.topics.payment-events}",
                   groupId = "${spring.kafka.consumer.group-id}")
    public void onPaymentEvent(Map<String, Object> event) {
        String eventType = (String) event.get("eventType");
        UUID orderId = UUID.fromString((String) event.get("orderId"));

        switch (eventType) {
            case "payment.succeeded" -> {
                UUID paymentId = UUID.fromString((String) event.get("paymentId"));
                orderService.onPaymentSucceeded(orderId, paymentId);
            }
            case "payment.failed" -> orderService.onPaymentFailed(orderId);
            default -> log.debug("Événement paiement ignoré : {}", eventType);
        }
    }

    @KafkaListener(topics = "${kafka.consumer.topics.delivery-events}",
                   groupId = "${spring.kafka.consumer.group-id}")
    public void onDeliveryEvent(Map<String, Object> event) {
        String eventType = (String) event.get("eventType");
        if ("delivery.delivered".equals(eventType)) {
            UUID orderId = UUID.fromString((String) event.get("orderId"));
            orderService.onDeliveryDelivered(orderId);
        }
    }
}
