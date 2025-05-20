package com.example.HotelBooking.dtos;

import com.example.HotelBooking.enums.BookingStatus;
import com.example.HotelBooking.enums.PaymentStatus;
import com.example.HotelBooking.enums.RoomType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public interface BookingHistoryProjection {
    Long getId();
    Long getRoomId();
    Integer getRoomNumber();
    RoomType getRoomType();
    BigDecimal getRoomPricePerNight();
    Integer getRoomCapacity();
    String getRoomDescription();
    String getRoomTitle();
    Long getUserId();
    String getUserEmail();
    LocalDate getCheckInDate();
    LocalDate getCheckOutDate();
    BigDecimal getTotalPrice();
    String getBookingReference();
    LocalDateTime getCreatedAt();
    BookingStatus getBookingStatus();
    PaymentStatus getPaymentStatus();
}

