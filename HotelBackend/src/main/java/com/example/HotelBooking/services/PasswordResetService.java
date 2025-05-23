package com.example.HotelBooking.services;

import com.example.HotelBooking.entities.PasswordResetToken;
import com.example.HotelBooking.entities.User;
import com.example.HotelBooking.exceptions.ResourceNotFoundException;
import com.example.HotelBooking.repositories.PasswordResetTokenRepository;
import com.example.HotelBooking.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    @Value("${fronteendUrl}")
    private String frontendUrl;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void createPasswordResetTokenForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        // Invalida todos os tokens existentes do usuário
        tokenRepository.invalidateExistingTokens(user);

        // Cria um novo token
        String token = UUID.randomUUID().toString();
        PasswordResetToken myToken = new PasswordResetToken();
        myToken.setUser(user);
        myToken.setToken(token);
        myToken.setExpiryDate(LocalDateTime.now().plusMinutes(30));
        myToken.setUsed(false);
        tokenRepository.save(myToken);

        sendPasswordResetEmail(user.getEmail(), token);
    }

    private void sendPasswordResetEmail(String email, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Quinta do Ypuã - Redefinição de Senha");
        message.setText("Prezado(a) hóspede,\n\n" +
                "Recebemos uma solicitação para redefinir a senha da sua conta.\n\n" +
                "Para redefinir sua senha, clique no link abaixo:\n\n" +
                frontendUrl + "/reset-password?token=" + token + "\n\n" +
                "Este link é válido por 30 minutos.\n\n" +
                "Se você não solicitou a redefinição de senha, por favor, ignore este e-mail.\n\n" +
                "Atenciosamente,\n" +
                "Equipe Quinta do Ypuã");

        mailSender.send(message);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Token inválido"));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new IllegalStateException("Token expirado");
        }

        if (resetToken.isUsed()) {
            throw new IllegalStateException("Token já foi utilizado");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Invalida o token atual e quaisquer outros tokens existentes
        tokenRepository.invalidateExistingTokens(user);
    }
}

