package com.example.HotelBooking.entities;

import com.example.HotelBooking.enums.RoomType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Data
@Table(name = "rooms")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Min(value = 1, message = "O número do quarto deve ser pelo menos 1")
    @Column(unique = true)
    private Integer roomNumber;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "O tipo de quarto é obrigatório")
    private RoomType type;

    @DecimalMin(value = "0.1", message = "Preço por diária é obrigatório")
    private BigDecimal pricePerNight;

    @Min(value = 1, message = "A capacidade deve ser de pelo menos 1")
    private Integer capacity;

    private String description; // dados adicionais para o quarto

    private String title; // titulo para os quartos

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @JsonIgnore
    @Column(name = "image_data")
    private byte[] imageData;
}

