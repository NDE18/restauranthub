package com.restaurant.reservation.domain.repository;

import com.restaurant.reservation.domain.model.Reservation;
import com.restaurant.reservation.domain.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    List<Reservation> findByUserIdOrderByReservationDateDesc(UUID userId);

    List<Reservation> findByRestaurantIdAndReservationDate(UUID restaurantId, LocalDate date);

    Optional<Reservation> findByIdempotencyKey(String idempotencyKey);

    @Query("""
            SELECT COUNT(r) FROM Reservation r
            WHERE r.restaurantId = :restaurantId
              AND r.reservationDate = :date
              AND r.startTime < :endTime
              AND r.endTime > :startTime
              AND r.status IN ('PENDING', 'CONFIRMED')
            """)
    long countOverlapping(@Param("restaurantId") UUID restaurantId,
                          @Param("date") LocalDate date,
                          @Param("startTime") LocalTime startTime,
                          @Param("endTime") LocalTime endTime);

    @Query("""
            SELECT r FROM Reservation r
            WHERE r.reservationDate = :tomorrow
              AND r.status = 'CONFIRMED'
            """)
    List<Reservation> findTomorrowConfirmed(@Param("tomorrow") LocalDate tomorrow);
}
