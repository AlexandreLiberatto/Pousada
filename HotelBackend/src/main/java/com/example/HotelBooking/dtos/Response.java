package com.example.HotelBooking.dtos;

import com.example.HotelBooking.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response {
    // Genérico
    private int status;
    private String message;

    // Para login
    private String token;
    private UserRole role; // <-- Este campo foi adicionado
    private Boolean isActive;
    private String expirationTime;

    // Saída de dados do usuário
    private UserDTO user;
    private List<UserDTO> users;

    // Saída de dados de reserva
    private BookingDTO booking;
    private List<BookingDTO> bookings;

    // Saída de dados dos quartos
    private RoomDTO room;
    private List<RoomDTO> rooms;

    // Saída de dados de pagamento
    private PaymentDTO payment;
    private List<PaymentDTO> payments;

    // Notificações
    private NotificationDTO notification;
    private List<NotificationDTO> notifications;

    private final LocalDateTime timestamp = LocalDateTime.now();
}