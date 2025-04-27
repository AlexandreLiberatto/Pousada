package com.example.HotelBooking.services;

import com.example.HotelBooking.dtos.NotificationDTO;
import com.example.HotelBooking.entities.Notification;
import com.example.HotelBooking.enums.NotificationType;
import com.example.HotelBooking.repositories.NotificationRepository;
import com.example.HotelBooking.services.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private JavaMailSender javaMailSender;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private NotificationDTO testNotificationDTO;

    @BeforeEach
    void setUp() {
        testNotificationDTO = NotificationDTO.builder()
                .recipient("test@example.com")
                .subject("Test Subject")
                .body("Test Body")
                .bookingReference("BOOK123")
                .build();
    }

    @Test
    void sendEmail_WithValidData_ShouldSaveNotification() {
        // Arrange
        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);

        // Act
        notificationService.sendEmail(testNotificationDTO);

        // Assert
        verify(notificationRepository, times(1)).save(notificationCaptor.capture());

        Notification savedNotification = notificationCaptor.getValue();
        assertEquals("test@example.com", savedNotification.getRecipient());
        assertEquals("Test Subject", savedNotification.getSubject());
        assertEquals(NotificationType.EMAIL, savedNotification.getType());
    }

    @Test
    void sendEmail_WithValidData_ShouldSendEmail() {
        // Arrange
        ArgumentCaptor<SimpleMailMessage> emailCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);

        // Act
        notificationService.sendEmail(testNotificationDTO);

        // Assert
        verify(javaMailSender, times(1)).send(emailCaptor.capture());

        SimpleMailMessage sentEmail = emailCaptor.getValue();
        assertEquals("test@example.com", sentEmail.getTo()[0]);
        assertEquals("Test Subject", sentEmail.getSubject());
        assertTrue(sentEmail.getText().contains("Test Body"));
    }

}