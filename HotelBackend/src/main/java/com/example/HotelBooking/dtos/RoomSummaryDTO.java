package com.example.HotelBooking.dtos;

import com.example.HotelBooking.enums.RoomType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomSummaryDTO {
    private Long id;
    private Integer roomNumber;
    private RoomType type;
    private BigDecimal pricePerNight;
    private Integer capacity;
    private String title;
    private String description;
}