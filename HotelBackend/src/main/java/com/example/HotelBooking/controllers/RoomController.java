package com.example.HotelBooking.controllers;

import com.example.HotelBooking.dtos.Response;
import com.example.HotelBooking.dtos.RoomDTO;
import com.example.HotelBooking.enums.RoomType;
import com.example.HotelBooking.services.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> addRoom(@RequestPart("room") RoomDTO roomDTO,
                                            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        return ResponseEntity.ok(roomService.addRoom(roomDTO, imageFile));
    }

    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> updateRoom(@RequestPart("room") RoomDTO roomDTO,
                                               @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        return ResponseEntity.ok(roomService.updateRoom(roomDTO, imageFile));
    }

    @GetMapping("/all")
    public ResponseEntity<Response> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getRoomImage(@PathVariable Long id) {
        byte[] imageData = roomService.getRoomImageData(id);
        if (imageData == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(imageData);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteRoom(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.deleteRoom(id));
    }

    @GetMapping("/available")
    public ResponseEntity<Response> getAvailableRooms(
            @RequestParam LocalDate checkInDate,
            @RequestParam LocalDate checkOutDate,
            @RequestParam(required = false) RoomType roomType
    ) {
        return ResponseEntity.ok(roomService.getAvailableRooms(checkInDate, checkOutDate, roomType));
    }

    @GetMapping("/types")
    public ResponseEntity<List<String>> getAllRoomTypes() {
        List<String> types = java.util.Arrays.stream(RoomType.values())
                .map(Enum::name)
                .toList();
        return ResponseEntity.ok(types);
    }

    @GetMapping("/search")
    public ResponseEntity<Response> searchRoom(@RequestParam String input) {
        return ResponseEntity.ok(roomService.searchRoom(input));
    }
}

