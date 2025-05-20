package com.example.HotelBooking.repositories;

import com.example.HotelBooking.entities.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId); //Buscar todas as reservas de um usuário específico

    @Query("SELECT DISTINCT b FROM Booking b LEFT JOIN FETCH b.user LEFT JOIN FETCH b.room r WHERE b.bookingReference = :reference")
    Optional<Booking> findByBookingReferenceWithDetails(@Param("reference") String reference);

    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.room r " +
           "WHERE b.bookingReference = :reference")
    Optional<Booking> findByBookingReference(@Param("reference") String reference);

    @Query("SELECT CASE WHEN COUNT(b) = 0 THEN true ELSE false END FROM Booking b " +
           "WHERE b.room.id = :roomId " +
           "AND ((b.checkInDate BETWEEN :checkIn AND :checkOut) " +
           "OR (b.checkOutDate BETWEEN :checkIn AND :checkOut))")
    boolean isRoomAvailable(@Param("roomId") Long roomId,
                           @Param("checkIn") LocalDate checkIn,
                           @Param("checkOut") LocalDate checkOut);

    @Query("""
        SELECT b.id AS id, b.room.id AS roomId, b.room.roomNumber AS roomNumber, b.room.type AS roomType, b.room.pricePerNight AS roomPricePerNight, b.room.capacity AS roomCapacity, b.room.description AS roomDescription, b.room.title AS roomTitle, b.user.id AS userId, b.user.email AS userEmail, b.checkInDate AS checkInDate, b.checkOutDate AS checkOutDate, b.totalPrice AS totalPrice, b.bookingReference AS bookingReference, b.createdAt AS createdAt, b.bookingStatus AS bookingStatus, b.paymentStatus AS paymentStatus
        FROM Booking b
        WHERE b.user.id = :userId
        ORDER BY b.id DESC
    """)
    java.util.List<com.example.HotelBooking.dtos.BookingHistoryProjection> findBookingHistoryByUserId(@Param("userId") Long userId);

    @Query("""
        SELECT b.id AS id, b.bookingReference AS bookingReference, b.paymentStatus AS paymentStatus, b.totalPrice AS totalPrice
        FROM Booking b
        WHERE b.bookingReference = :reference
    """)
    java.util.Optional<com.example.HotelBooking.dtos.BookingPaymentProjection> findPaymentProjectionByBookingReference(@Param("reference") String reference);
}
