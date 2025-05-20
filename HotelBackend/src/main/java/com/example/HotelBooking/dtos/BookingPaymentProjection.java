package com.example.HotelBooking.dtos;

import com.example.HotelBooking.enums.PaymentStatus;
import java.math.BigDecimal;

public interface BookingPaymentProjection {
    Long getId();
    String getBookingReference();
    PaymentStatus getPaymentStatus();
    BigDecimal getTotalPrice();
}

