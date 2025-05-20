package com.example.HotelBooking.payments.stripe;

import com.example.HotelBooking.payments.stripe.dto.PaymentRequest;
import com.example.HotelBooking.payments.stripe.dto.PaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/pay")
    public ResponseEntity<String> createPaymentIntent(@RequestBody PaymentRequest paymentRequest){
        try {
            String clientSecret = paymentService.createPaymentIntent(paymentRequest);
            return ResponseEntity.ok(clientSecret);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao iniciar pagamento: " + e.getMessage());
        }
    }

    @PutMapping("/update")
    public void updatePaymentBooking(@RequestBody PaymentRequest paymentRequest){
        paymentService.updatePaymentBooking(paymentRequest);
    }

}
