package com.restaurant.reservation.exception;

import java.time.LocalDate;
import java.time.LocalTime;

public class SlotUnavailableException extends RuntimeException {
    public SlotUnavailableException(LocalDate date, LocalTime time) {
        super("Créneau indisponible : " + date + " à " + time);
    }
}
