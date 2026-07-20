package com.restaurant.user.events;

import com.restaurant.user.domain.model.User;
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
public class UserEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topics.user-events}")
    private String userEventsTopic;

    public void publishUserCreated(User user) {
        publish("user.created", user.getId().toString(), Map.of(
                "eventType", "user.created",
                "userId", user.getId(),
                "email", user.getEmail(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "timestamp", Instant.now().toString()
        ));
    }

    public void publishUserUpdated(User user) {
        publish("user.updated", user.getId().toString(), Map.of(
                "eventType", "user.updated",
                "userId", user.getId(),
                "email", user.getEmail(),
                "timestamp", Instant.now().toString()
        ));
    }

    public void publishUserDeleted(User user) {
        publish("user.deleted", user.getId().toString(), Map.of(
                "eventType", "user.deleted",
                "userId", user.getId(),
                "timestamp", Instant.now().toString()
        ));
    }

    public void publishEmailVerified(User user) {
        publish("user.email-verified", user.getId().toString(), Map.of(
                "eventType", "user.email-verified",
                "userId", user.getId(),
                "email", user.getEmail(),
                "timestamp", Instant.now().toString()
        ));
    }

    private void publish(String eventType, String key, Object payload) {
        kafkaTemplate.send(userEventsTopic, key, payload)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Erreur publication événement {} : {}", eventType, ex.getMessage());
                    } else {
                        log.debug("Événement {} publié sur partition {}", eventType,
                                result.getRecordMetadata().partition());
                    }
                });
    }
}
