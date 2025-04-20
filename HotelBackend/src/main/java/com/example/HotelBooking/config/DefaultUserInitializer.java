package com.example.HotelBooking.config;

import com.example.HotelBooking.entities.User;
import com.example.HotelBooking.enums.UserRole;
import com.example.HotelBooking.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

@Component
public class DefaultUserInitializer implements CommandLineRunner {

    //IMPORTANDO VARIAVEL
    @Value("${emailAdmin}")
    private String adminemail;

    //IMPORTANDO VARIAVEL
    @Value("${senhaAdmin}")
    private String adminsenha;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DefaultUserInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String adminEmail = adminemail; //E-MAIL PARA LOGAR COMO ADMIN

        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminsenha)) //SENHA PARA LOGAR COMO ADMIN
                    .firstName("Alexandre")
                    .lastName("Liberato")
                    .phoneNumber("48991604054")
                    .role(UserRole.ADMIN)
                    .isActive(true)
                    .build();

            userRepository.save(admin);
            System.out.println("Usuário ADMIN criado com sucesso!");
        }
    }
}
