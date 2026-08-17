package com.restaurant.reservation.application;

import com.restaurant.reservation.api.dto.CreateReservationRequest;
import com.restaurant.reservation.api.dto.ReservationResponse;
import com.restaurant.reservation.domain.model.Reservation;
import com.restaurant.reservation.domain.model.ReservationStatus;
import com.restaurant.reservation.domain.repository.ReservationRepository;
import com.restaurant.reservation.events.ReservationEventPublisher;
import com.restaurant.reservation.exception.ReservationNotFoundException;
import com.restaurant.reservation.exception.SlotUnavailableException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReservationService {

    private static final LocalTime SLOT_DURATION = LocalTime.of(2, 0);

    private final ReservationRepository repository;
    private final ReservationEventPublisher eventPublisher;
    private final RedissonClient redissonClient;

    public List<String> getAvailableSlots(UUID restaurantId, LocalDate date, int guests) {
        // Créneaux fixes de 12h à 22h par heure
        return List.of("12:00", "13:00", "14:00", "19:00", "20:00", "21:00")
                .stream()
                .filter(slot -> {
                    LocalTime start = LocalTime.parse(slot);
                    LocalTime end = start.plusHours(2);
                    return repository.countOverlapping(restaurantId, date, start, end) < 10;
                })
                .toList();
    }

    public ReservationResponse create(CreateReservationRequest req, UUID userId) {
        // Idempotence
        if (req.getIdempotencyKey() != null) {
            return repository.findByIdempotencyKey(req.getIdempotencyKey())
                    .map(this::toResponse)
                    .orElseGet(() -> doCreate(req, userId));
        }
        return doCreate(req, userId);
    }

    private ReservationResponse doCreate(CreateReservationRequest req, UUID userId) {
        String lockKey = "reservation:" + req.getRestaurantId() + ":" + req.getReservationDate();
        RLock lock = redissonClient.getLock(lockKey);

        try {
            lock.lock(10, TimeUnit.SECONDS);

            LocalTime end = req.getStartTime().plusHours(2);
            long overlapping = repository.countOverlapping(
                    req.getRestaurantId(), req.getReservationDate(), req.getStartTime(), end);

            if (overlapping >= 10) {
                throw new SlotUnavailableException(req.getReservationDate(), req.getStartTime());
            }

            Reservation reservation = Reservation.builder()
                    .restaurantId(req.getRestaurantId())
                    .userId(userId)
                    .reservationDate(req.getReservationDate())
                    .startTime(req.getStartTime())
                    .endTime(end)
                    .guestsCount(req.getGuestsCount())
                    .specialRequests(req.getSpecialRequests())
                    .idempotencyKey(req.getIdempotencyKey())
                    .status(ReservationStatus.CONFIRMED)
                    .build();

            reservation = repository.save(reservation);
            eventPublisher.publishCreated(reservation);
            return toResponse(reservation);

        } finally {
            if (lock.isHeldByCurrentThread()) lock.unlock();
        }
    }

    @Transactional(readOnly = true)
    public ReservationResponse getById(UUID id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ReservationNotFoundException(id));
    }

    public ReservationResponse update(UUID id, CreateReservationRequest req) {
        Reservation r = repository.findById(id)
                .orElseThrow(() -> new ReservationNotFoundException(id));
        if (req.getReservationDate() != null) r.setReservationDate(req.getReservationDate());
        if (req.getStartTime() != null) r.setStartTime(req.getStartTime());
        if (req.getGuestsCount() > 0) r.setGuestsCount(req.getGuestsCount());
        return toResponse(repository.save(r));
    }

    public void cancel(UUID id) {
        Reservation r = repository.findById(id)
                .orElseThrow(() -> new ReservationNotFoundException(id));
        r.setStatus(ReservationStatus.CANCELLED);
        repository.save(r);
        eventPublisher.publishCancelled(r);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getByUserId(UUID userId) {
        return repository.findByUserIdOrderByReservationDateDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    @Scheduled(cron = "0 0 10 * * *") // Tous les jours à 10h
    public void sendReminderNotifications() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Reservation> reservations = repository.findTomorrowConfirmed(tomorrow);
        reservations.forEach(eventPublisher::publishReminder);
        log.info("Rappels J-1 envoyés pour {} réservations", reservations.size());
    }

    private ReservationResponse toResponse(Reservation r) {
        return ReservationResponse.builder()
                .id(r.getId())
                .restaurantId(r.getRestaurantId())
                .userId(r.getUserId())
                .reservationDate(r.getReservationDate())
                .startTime(r.getStartTime())
                .endTime(r.getEndTime())
                .guestsCount(r.getGuestsCount())
                .status(r.getStatus())
                .specialRequests(r.getSpecialRequests())
                .createdAt(r.getCreatedAt())
                .build();
    }

    public void toTry(){
        log.info("Success ");
    }
}
