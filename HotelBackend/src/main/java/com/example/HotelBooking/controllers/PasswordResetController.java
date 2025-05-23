package com.example.HotelBooking.controllers;

import com.example.HotelBooking.dtos.ForgotPasswordRequest;
import com.example.HotelBooking.dtos.ResetPasswordRequest;
import com.example.HotelBooking.dtos.Response;
import com.example.HotelBooking.services.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/password")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot")
    public ResponseEntity<Response> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        passwordResetService.createPasswordResetTokenForUser(request.getEmail());
        return ResponseEntity.ok(Response.builder()
                .message("Se o email existir em nossa base, você receberá as instruções para redefinição de senha")
                .build());
    }

    @PostMapping("/reset")
    public ResponseEntity<Response> resetPassword(@RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Response.builder()
                .message("Senha alterada com sucesso")
                .build());
    }
}
