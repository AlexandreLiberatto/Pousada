package com.example.HotelBooking.dtos;

import com.example.HotelBooking.enums.RoomType;
import java.math.BigDecimal;

public interface RoomAvailableProjection {
    Long getId();
    Integer getRoomNumber();
    RoomType getType();
    BigDecimal getPricePerNight();
    Integer getCapacity();
    String getDescription();
    String getTitle();
}

