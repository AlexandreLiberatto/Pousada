package com.example.HotelBooking.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {

    @NotBlank(message = "E-mail é Obrigatório!")
    private String email;

    @NotBlank(message = "Senha é Obrigatória!")
    private String password;
}
