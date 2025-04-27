package com.example.HotelBooking.services;

import com.example.HotelBooking.dtos.BookingDTO;
import com.example.HotelBooking.dtos.NotificationDTO;
import com.example.HotelBooking.dtos.Response;
import com.example.HotelBooking.entities.Booking;
import com.example.HotelBooking.entities.Room;
import com.example.HotelBooking.entities.User;
import com.example.HotelBooking.enums.BookingStatus;
import com.example.HotelBooking.enums.PaymentStatus;
import com.example.HotelBooking.exceptions.InvalidBookingStateAndDateException;
import com.example.HotelBooking.exceptions.NotFoundException;
import com.example.HotelBooking.repositories.BookingRepository;
import com.example.HotelBooking.repositories.RoomRepository;
import com.example.HotelBooking.services.impl.BookingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserService userService;

    @Mock
    private BookingCodeGenerator bookingCodeGenerator;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private User testUser;
    private Room testRoom;
    private BookingDTO testBookingDTO;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");

        testRoom = new Room();
        testRoom.setId(1L);
        testRoom.setPricePerNight(BigDecimal.valueOf(100));

        testBookingDTO = new BookingDTO();
        testBookingDTO.setRoomId(1L);
        testBookingDTO.setCheckInDate(LocalDate.now().plusDays(1));
        testBookingDTO.setCheckOutDate(LocalDate.now().plusDays(3));
    }

    @Test
    void createBooking_WithValidData_ShouldReturnSuccess() {
        // Arrange
        when(userService.getCurrentLoggedInUser()).thenReturn(testUser);
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(bookingRepository.isRoomAvailable(anyLong(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(true);
        when(bookingCodeGenerator.generateBookingReference()).thenReturn("BOOK123");
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Response response = bookingService.createBooking(testBookingDTO);

        // Assert
        assertEquals(200, response.getStatus());
        assertEquals("Reserva efetuada com sucesso", response.getMessage());
        verify(notificationService, times(1)).sendEmail(any(NotificationDTO.class));
    }

    @Test
    void createBooking_WithUnavailableRoom_ShouldThrowException() {
        // Arrange
        when(userService.getCurrentLoggedInUser()).thenReturn(testUser);
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(bookingRepository.isRoomAvailable(anyLong(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(false);

        // Act & Assert
        assertThrows(InvalidBookingStateAndDateException.class, () -> {
            bookingService.createBooking(testBookingDTO);
        });
    }


    @Test
    void findBookingByReferenceNo_WithNonExistingReference_ShouldThrowException() {
        // Arrange
        when(bookingRepository.findByBookingReference("INVALID")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> {
            bookingService.findBookingByReferenceNo("INVALID");
        });
    }
}