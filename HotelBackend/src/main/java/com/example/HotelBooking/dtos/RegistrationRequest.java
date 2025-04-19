package com.example.HotelBooking.dtos;

import com.example.HotelBooking.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegistrationRequest {

    @NotBlank(message = "Nome é obrigatório")
    private String firstName;

    @NotBlank(message = "Sobrenome é obrigatório")
    private String lastName;

    @NotBlank(message = "E-mail é obrigatório")
    private String email;

    @NotBlank(message = "Número de telefone é obrigatório")
    private String phoneNumber;

    private UserRole role; //opcional

    @NotBlank(message = "Senha é obrigatório")
    private String password;
}
