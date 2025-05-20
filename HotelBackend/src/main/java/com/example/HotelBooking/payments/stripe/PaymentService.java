package com.example.HotelBooking.payments.stripe;


import com.example.HotelBooking.dtos.NotificationDTO;
import com.example.HotelBooking.entities.Booking;
import com.example.HotelBooking.entities.PaymentEntity;
import com.example.HotelBooking.enums.NotificationType;
import com.example.HotelBooking.enums.PaymentGateway;
import com.example.HotelBooking.enums.PaymentStatus;
import com.example.HotelBooking.exceptions.NotFoundException;
import com.example.HotelBooking.payments.stripe.dto.PaymentRequest;
import com.example.HotelBooking.repositories.BookingRepository;
import com.example.HotelBooking.repositories.PaymentRepository;
import com.example.HotelBooking.services.NotificationService;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;

    @Value("${stripe.api.secret.key}")
    private String secreteKey;


    public String createPaymentIntent(PaymentRequest paymentRequest){
        if (paymentRequest.getBookingReference() == null || paymentRequest.getBookingReference().isBlank()) {
            throw new IllegalArgumentException("bookingReference é obrigatório");
        }
        if (paymentRequest.getAmount() == null || paymentRequest.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("amount deve ser maior que zero");
        }
        Stripe.apiKey = secreteKey;
        String bookingReference = paymentRequest.getBookingReference();

        var bookingProjection = bookingRepository.findPaymentProjectionByBookingReference(bookingReference)
                .orElseThrow(() -> new NotFoundException("Reserva Não Encontrada"));

        if (bookingProjection.getPaymentStatus() == PaymentStatus.COMPLETED) {
            throw new NotFoundException("Pagamento já efetuado para esta reserva");
        }

        try{
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(paymentRequest.getAmount().multiply(BigDecimal.valueOf(100)).longValue())
                    .setCurrency("usd")
                    .putMetadata("bookingReference", bookingReference)
                    .build();
            PaymentIntent intent = PaymentIntent.create(params);
            return intent.getClientSecret();
        } catch (Exception e) {
            log.error("Erro ao criar PaymentIntent: ", e);
            throw new RuntimeException("Erro ao criar pagamento: " + e.getMessage());
        }
    }


    @org.springframework.transaction.annotation.Transactional
    public void updatePaymentBooking(PaymentRequest paymentRequest) {
        try {
            String bookingReference = paymentRequest.getBookingReference();
            if (bookingReference == null || bookingReference.isBlank()) {
                throw new IllegalArgumentException("Referência da reserva é obrigatória");
            }

            Booking booking = bookingRepository.findByBookingReference(bookingReference)
                    .orElseThrow(() -> new NotFoundException("Reserva não encontrada: " + bookingReference));

            PaymentEntity payment = new PaymentEntity();
            payment.setPaymentGateway(PaymentGateway.STRIPE);
            payment.setAmount(paymentRequest.getAmount());
            payment.setTransactionId(paymentRequest.getTransactionId());
            payment.setPaymentStatus(paymentRequest.isSuccess() ? PaymentStatus.COMPLETED : PaymentStatus.FAILED);
            payment.setPaymentDate(LocalDateTime.now());
            payment.setBookingReference(bookingReference);
            payment.setUser(booking.getUser());

            if (!paymentRequest.isSuccess()) {
                payment.setFailureReason(paymentRequest.getFailureReason());
            }

            paymentRepository.save(payment);

            NotificationDTO notificationDTO = NotificationDTO.builder()
                    .recipient(booking.getUser().getEmail())
                    .type(NotificationType.EMAIL)
                    .bookingReference(bookingReference)
                    .build();

            if (paymentRequest.isSuccess()) {
                booking.setPaymentStatus(PaymentStatus.COMPLETED);
                bookingRepository.save(booking);

                notificationDTO.setSubject("Pagamento da reserva realizado com sucesso");
                notificationDTO.setBody(String.format(
                    "Parabéns! Seu pagamento pela reserva com referência %s foi realizado com sucesso.\n\n" +
                    "Detalhes da reserva:\n" +
                    "- Check-in: %s\n" +
                    "- Check-out: %s\n" +
                    "- Valor: R$ %.2f\n\n" +
                    "Obrigado por escolher nossos serviços!",
                    bookingReference,
                    booking.getCheckInDate(),
                    booking.getCheckOutDate(),
                    payment.getAmount()
                ));

                try {
                    notificationService.sendEmail(notificationDTO);
                } catch (Exception e) {
                    log.error("Erro ao enviar email de confirmação");
                }
            } else {
                booking.setPaymentStatus(PaymentStatus.FAILED);
                bookingRepository.save(booking);

                notificationDTO.setSubject("Falha no pagamento da reserva");
                notificationDTO.setBody(String.format(
                    "Seu pagamento pela reserva %s falhou.\nMotivo: %s\n\n" +
                    "Por favor, tente novamente ou entre em contato conosco para assistência.",
                    bookingReference,
                    paymentRequest.getFailureReason()
                ));

                try {
                    notificationService.sendEmail(notificationDTO);
                } catch (Exception e) {
                    log.error("Erro ao enviar email de falha no pagamento");
                }
            }
        } catch (Exception e) {
            log.error("Erro ao processar pagamento: {}", e.getMessage());
            throw new RuntimeException("Erro ao processar pagamento: " + e.getMessage());
        }
    }
}

