package com.example.HotelBooking.dtos;

import com.example.HotelBooking.enums.RoomType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class RoomDTO {

    private Long id;

    @Min(value = 1, message = "O número do quarto deve ser pelo menos 1")
    private Integer roomNumber;

    @NotNull(message = "O tipo de quarto é obrigatório")
    private RoomType type;

    @DecimalMin(value = "0.1", message = "Preço por diária é obrigatório")
    private BigDecimal pricePerNight;

    @Min(value = 1, message = "A capacidade deve ser de pelo menos 1")
    private Integer capacity;

    private String description; // dados adicionais para o quarto

    @Pattern(regexp = "^(https?://).+",
            message = "URL da imagem inválida. Deve começar com http:// ou https://")
    private String imageUrl;
}