package com.example.HotelBooking.services.impl;

import com.example.HotelBooking.dtos.BookingDTO;
import com.example.HotelBooking.dtos.NotificationDTO;
import com.example.HotelBooking.dtos.Response;
import com.example.HotelBooking.dtos.RoomDTO;
import com.example.HotelBooking.entities.Booking;
import com.example.HotelBooking.entities.Room;
import com.example.HotelBooking.entities.User;
import com.example.HotelBooking.enums.BookingStatus;
import com.example.HotelBooking.enums.PaymentStatus;
import com.example.HotelBooking.exceptions.InvalidBookingStateAndDateException;
import com.example.HotelBooking.exceptions.NotFoundException;
import com.example.HotelBooking.repositories.BookingRepository;
import com.example.HotelBooking.repositories.RoomRepository;
import com.example.HotelBooking.services.BookingCodeGenerator;
import com.example.HotelBooking.services.BookingService;
import com.example.HotelBooking.services.NotificationService;
import com.example.HotelBooking.services.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    @Value("${fronteendUrl}")
    private String frontendUrl;

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final NotificationService notificationService;
    private final ModelMapper modelMapper;
    private final UserService userService;
    private final BookingCodeGenerator bookingCodeGenerator;

    @Override
    @Transactional(readOnly = true)
    public Response getAllBookings() {
        try {
            List<Booking> bookings = bookingRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));

            List<BookingDTO> bookingDTOList = bookings.stream()
                .map(booking -> {
                    try {
                        // Validações de campos obrigatórios
                        if (booking.getUser() == null || booking.getRoom() == null) {
                            log.warn("Booking {} tem user ou room nulo", booking.getId());
                            return null;
                        }

                        // Limpa imageData para evitar erro de LOB
                        booking.getRoom().setImageData(null);

                        // Garante que totalPrice seja válido
                        if (booking.getTotalPrice() == null && booking.getCheckInDate() != null && booking.getCheckOutDate() != null) {
                            booking.setTotalPrice(calculateTotalPrice(booking.getRoom(), BookingDTO.builder()
                                .checkInDate(booking.getCheckInDate())
                                .checkOutDate(booking.getCheckOutDate())
                                .build()));
                        }

                        // Garante que os status sejam válidos
                        if (booking.getBookingStatus() == null) {
                            booking.setBookingStatus(BookingStatus.BOOKED);
                        }
                        if (booking.getPaymentStatus() == null) {
                            booking.setPaymentStatus(PaymentStatus.PENDING);
                        }

                        return modelMapper.map(booking, BookingDTO.class);
                    } catch (Exception e) {
                        log.error("Erro ao processar booking {}: {}", booking.getId(), e.getMessage());
                        return null;
                    }
                })
                .filter(dto -> dto != null)
                .toList();

            return Response.builder()
                    .status(200)
                    .message("success")
                    .bookings(bookingDTOList)
                    .build();

        } catch (Exception e) {
            log.error("Erro ao buscar todas as reservas: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public Response createBooking(BookingDTO bookingDTO) {
        User currentUser = userService.getCurrentLoggedInUser();
        Room room = roomRepository.findById(bookingDTO.getRoomId())
                .orElseThrow(() -> new NotFoundException("Quarto não encontrado"));

        if (bookingDTO.getCheckInDate().isBefore(LocalDate.now())) {
            throw new InvalidBookingStateAndDateException("A data de entrada não pode ser antes de hoje");
        }

        if (bookingDTO.getCheckOutDate().isBefore(bookingDTO.getCheckInDate())) {
            throw new InvalidBookingStateAndDateException("A data de saída não pode ser anterior à data de entrada");
        }

        if (bookingDTO.getCheckInDate().isEqual(bookingDTO.getCheckOutDate())) {
            throw new InvalidBookingStateAndDateException("A data de entrada não pode ser igual à data de saída");
        }

        boolean isAvailable = bookingRepository.isRoomAvailable(room.getId(), bookingDTO.getCheckInDate(), bookingDTO.getCheckOutDate());
        if (!isAvailable) {
            throw new InvalidBookingStateAndDateException("O quarto não está disponível para os intervalos de datas selecionados");
        }

        BigDecimal totalPrice = calculateTotalPrice(room, bookingDTO);
        String bookingReference = bookingCodeGenerator.generateBookingReference();

        Booking booking = new Booking();
        booking.setUser(currentUser);
        booking.setRoom(room);
        booking.setCheckInDate(bookingDTO.getCheckInDate());
        booking.setCheckOutDate(bookingDTO.getCheckOutDate());
        booking.setTotalPrice(totalPrice);
        booking.setBookingReference(bookingReference);
        booking.setBookingStatus(BookingStatus.BOOKED);
        booking.setPaymentStatus(PaymentStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());

        bookingRepository.save(booking);

        String paymentUrl = frontendUrl + "/payment/" + bookingReference + "/" + totalPrice;

        NotificationDTO notificationDTO = NotificationDTO.builder()
                .recipient(currentUser.getEmail())
                .subject("Confirmação de Reserva | Quinta do Ypuã")
                .body("Sua reserva foi criada com sucesso. Prossiga com o pagamento usando o link abaixo.\n\n" + paymentUrl)
                .bookingReference(bookingReference)
                .build();

        notificationService.sendEmail(notificationDTO);

        return Response.builder()
                .status(200)
                .message("Reserva efetuada com sucesso")
                .booking(modelMapper.map(booking, BookingDTO.class))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Response findBookingByReferenceNo(String bookingReference) {
        try {
            Booking booking = bookingRepository.findByBookingReferenceWithDetails(bookingReference)
                    .orElseThrow(() -> new NotFoundException("Reserva com referência nº: " + bookingReference + " não encontrada"));

            // Validações de campos obrigatórios
            if (booking.getUser() == null) {
                throw new NotFoundException("Usuário associado à reserva não encontrado.");
            }
            if (booking.getRoom() == null) {
                throw new NotFoundException("Quarto associado à reserva não encontrado.");
            }

            // Limpa o campo imageData explicitamente
            if (booking.getRoom() != null) {
                booking.getRoom().setImageData(null);
            }

            // Garante valores padrão para campos que não podem ser nulos
            if (booking.getBookingStatus() == null) {
                booking.setBookingStatus(BookingStatus.BOOKED);
            }
            if (booking.getPaymentStatus() == null) {
                booking.setPaymentStatus(PaymentStatus.PENDING);
            }
            if (booking.getTotalPrice() == null && booking.getCheckInDate() != null && booking.getCheckOutDate() != null) {
                booking.setTotalPrice(calculateTotalPrice(booking.getRoom(), BookingDTO.builder()
                    .checkInDate(booking.getCheckInDate())
                    .checkOutDate(booking.getCheckOutDate())
                    .build()));
            }

            BookingDTO bookingDTO = modelMapper.map(booking, BookingDTO.class);

            // Configura a URL da imagem do quarto
            if (bookingDTO.getRoom() != null) {
                bookingDTO.getRoom().setImageUrl("/api/rooms/" + booking.getRoom().getId() + "/image");
            }

            return Response.builder()
                    .status(200)
                    .message("success")
                    .booking(bookingDTO)
                    .build();

        } catch (Exception e) {
            log.error("Erro ao buscar reserva: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public Response updateBooking(BookingDTO bookingDTO) {
        if (bookingDTO.getId() == null) {
            throw new NotFoundException("ID da reserva é obrigatório.");
        }

        Booking existing = bookingRepository.findById(bookingDTO.getId())
                .orElseThrow(() -> new NotFoundException("Reserva não encontrada."));

        if (bookingDTO.getBookingStatus() != null) {
            existing.setBookingStatus(bookingDTO.getBookingStatus());
        }

        if (bookingDTO.getPaymentStatus() != null) {
            existing.setPaymentStatus(bookingDTO.getPaymentStatus());
        }

        bookingRepository.save(existing);

        return Response.builder()
                .status(200)
                .message("Reserva atualizada com sucesso")
                .build();
    }

    @Transactional(readOnly = true)
    public Response getBookingsByCurrentUser() {
        try {
            User currentUser = userService.getCurrentLoggedInUser();
            var projections = bookingRepository.findBookingHistoryByUserId(currentUser.getId());
            List<BookingDTO> bookingDTOList = projections.stream().map(p -> {
                BookingDTO dto = BookingDTO.builder()
                        .id(p.getId())
                        .checkInDate(p.getCheckInDate())
                        .checkOutDate(p.getCheckOutDate())
                        .totalPrice(p.getTotalPrice())
                        .bookingReference(p.getBookingReference())
                        .createdAt(p.getCreatedAt())
                        .bookingStatus(p.getBookingStatus())
                        .paymentStatus(p.getPaymentStatus())
                        .room(RoomDTO.builder()
                                .id(p.getRoomId())
                                .roomNumber(p.getRoomNumber())
                                .type(p.getRoomType())
                                .pricePerNight(p.getRoomPricePerNight())
                                .capacity(p.getRoomCapacity())
                                .description(p.getRoomDescription())
                                .title(p.getRoomTitle())
                                .imageUrl("/api/rooms/" + p.getRoomId() + "/image")
                                .build())
                        .build();
                return dto;
            }).toList();
            return Response.builder().status(200).bookings(bookingDTOList).build();
        } catch (Exception e) {
            return Response.builder().status(500).message("Erro ao buscar histórico de reservas: " + e.getMessage()).build();
        }
    }

    private BigDecimal calculateTotalPrice(Room room, BookingDTO bookingDTO) {
        BigDecimal pricePerNight = room.getPricePerNight();
        long days = ChronoUnit.DAYS.between(bookingDTO.getCheckInDate(), bookingDTO.getCheckOutDate());
        return pricePerNight.multiply(BigDecimal.valueOf(days));
    }
}
