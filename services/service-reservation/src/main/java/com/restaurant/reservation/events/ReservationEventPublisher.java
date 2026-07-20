package com.restaurant.reservation.events;

import com.restaurant.reservation.domain.model.Reservation;
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
public class ReservationEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topics.reservation-events}")
    private String topic;

    public void publishCreated(Reservation r) {
        send("reservation.created", r, "reservation.created");
    }

    public void publishCancelled(Reservation r) {
        send("reservation.cancelled", r, "reservation.cancelled");
    }

    public void publishReminder(Reservation r) {
        send("reservation.reminder", r, "reservation.reminder");
    }

    private void send(String eventType, Reservation r, String type) {
        kafkaTemplate.send(topic, r.getId().toString(), Map.of(
                "eventType", type,
                "reservationId", r.getId(),
                "restaurantId", r.getRestaurantId(),
                "userId", r.getUserId(),
                "date", r.getReservationDate().toString(),
                "time", r.getStartTime().toString(),
                "guests", r.getGuestsCount(),
                "status", r.getStatus().name(),
                "timestamp", Instant.now().toString()
        )).whenComplete((res, ex) -> {
            if (ex != null) log.error("Erreur publication {} : {}", eventType, ex.getMessage());
        });
    }
}
