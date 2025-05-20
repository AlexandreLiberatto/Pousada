package com.example.HotelBooking.repositories;

import com.example.HotelBooking.entities.Room;
import com.example.HotelBooking.enums.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {


    @Query("""
            SELECT r FROM Room r
            WHERE
                r.id NOT IN (
                    SELECT b.room.id
                    FROM Booking b
                    WHERE :checkInDate <= b.checkOutDate
                    AND :checkOutDate >= b.checkInDate
                    AND b.bookingStatus IN ('BOOKED', 'CHECKED_IN')
                )
                AND (:roomType IS NULL OR r.type = :roomType)
            """)
    List<Room> findAvailableRooms(
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate,
            @Param("roomType") RoomType roomType
    );

    @Query("""
            SELECT r.id AS id, r.roomNumber AS roomNumber, r.type AS type, r.pricePerNight AS pricePerNight, r.capacity AS capacity, r.description AS description, r.title AS title
            FROM Room r
            WHERE
                r.id NOT IN (
                    SELECT b.room.id
                    FROM Booking b
                    WHERE :checkInDate <= b.checkOutDate
                    AND :checkOutDate >= b.checkInDate
                    AND b.bookingStatus IN ('BOOKED', 'CHECKED_IN')
                )
                AND (:roomType IS NULL OR r.type = :roomType)
            """)
    List<com.example.HotelBooking.dtos.RoomAvailableProjection> findAvailableRoomsProjection(
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate,
            @Param("roomType") RoomType roomType
    );

    @Query("""
                SELECT r FROM Room r
                WHERE CAST(r.roomNumber AS string) LIKE %:searchParam%
                   OR LOWER(r.type) LIKE LOWER(:searchParam)
                   OR CAST(r.pricePerNight AS string) LIKE %:searchParam%
                   OR CAST(r.capacity AS string) LIKE %:searchParam%
                   OR LOWER(r.description) LIKE LOWER(CONCAT('%', :searchParam, '%'))
                   OR LOWER(r.title) LIKE LOWER(CONCAT('%', :searchParam, '%'))
            """)
    List<Room> searchRooms(@Param("searchParam") String searchParam);


}
