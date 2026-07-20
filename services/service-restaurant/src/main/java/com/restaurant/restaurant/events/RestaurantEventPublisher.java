package com.restaurant.restaurant.events;

import com.restaurant.restaurant.domain.model.Restaurant;
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
public class RestaurantEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topics.restaurant-events}")
    private String topic;

    public void publishCreated(Restaurant r) {
        send("restaurant.created", r.getId().toString(), Map.of(
                "eventType", "restaurant.created",
                "restaurantId", r.getId(),
                "name", r.getName(),
                "city", r.getCity(),
                "timestamp", Instant.now().toString()
        ));
    }

    public void publishUpdated(Restaurant r) {
        send("restaurant.updated", r.getId().toString(), Map.of(
                "eventType", "restaurant.updated",
                "restaurantId", r.getId(),
                "timestamp", Instant.now().toString()
        ));
    }

    public void publishClosed(Restaurant r) {
        send("restaurant.closed", r.getId().toString(), Map.of(
                "eventType", "restaurant.closed",
                "restaurantId", r.getId(),
                "timestamp", Instant.now().toString()
        ));
    }

    private void send(String eventType, String key, Object payload) {
        kafkaTemplate.send(topic, key, payload)
                .whenComplete((res, ex) -> {
                    if (ex != null) log.error("Erreur publication {} : {}", eventType, ex.getMessage());
                });
    }
}
