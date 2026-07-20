package com.restaurant.order.events;

import com.restaurant.order.domain.model.Order;
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
public class OrderEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topics.order-events}")
    private String topic;

    public void publishCreated(Order o) {
        send("order.created", o, Map.of(
                "eventType", "order.created",
                "orderId", o.getId(),
                "userId", o.getUserId(),
                "restaurantId", o.getRestaurantId(),
                "totalAmount", o.getTotalAmount(),
                "type", o.getType().name(),
                "timestamp", Instant.now().toString()
        ));
    }

    public void publishPaid(Order o) {
        send("order.paid", o, Map.of(
                "eventType", "order.paid",
                "orderId", o.getId(),
                "userId", o.getUserId(),
                "restaurantId", o.getRestaurantId(),
                "paymentId", o.getPaymentId(),
                "type", o.getType().name(),
                "deliveryAddress", o.getDeliveryAddress() != null ? o.getDeliveryAddress() : "",
                "timestamp", Instant.now().toString()
        ));
    }

    public void publishReady(Order o) {
        send("order.ready", o, Map.of(
                "eventType", "order.ready",
                "orderId", o.getId(),
                "userId", o.getUserId(),
                "timestamp", Instant.now().toString()
        ));
    }

    public void publishCompleted(Order o) {
        send("order.completed", o, Map.of(
                "eventType", "order.completed",
                "orderId", o.getId(),
                "userId", o.getUserId(),
                "timestamp", Instant.now().toString()
        ));
    }

    public void publishCancelled(Order o) {
        send("order.cancelled", o, Map.of(
                "eventType", "order.cancelled",
                "orderId", o.getId(),
                "userId", o.getUserId(),
                "timestamp", Instant.now().toString()
        ));
    }

    private void send(String eventType, Order o, Map<String, Object> payload) {
        kafkaTemplate.send(topic, o.getId().toString(), payload)
                .whenComplete((res, ex) -> {
                    if (ex != null) log.error("Erreur publication {} : {}", eventType, ex.getMessage());
                });
    }
}
