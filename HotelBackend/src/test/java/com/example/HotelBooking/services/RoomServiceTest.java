package com.example.HotelBooking.services;

import com.example.HotelBooking.dtos.Response;
import com.example.HotelBooking.dtos.RoomDTO;
import com.example.HotelBooking.entities.Room;
import com.example.HotelBooking.enums.RoomType;
import com.example.HotelBooking.exceptions.NotFoundException;
import com.example.HotelBooking.repositories.RoomRepository;
import com.example.HotelBooking.services.impl.RoomServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private RoomServiceImpl roomService;

    private Room testRoom;
    private RoomDTO testRoomDTO;

    @BeforeEach
    void setUp() {
        testRoom = new Room();
        testRoom.setId(1L);
        testRoom.setRoomNumber(101);
        testRoom.setType(RoomType.SINGLE);
        testRoom.setPricePerNight(BigDecimal.valueOf(100));
        testRoom.setCapacity(2);

        testRoomDTO = new RoomDTO();
        testRoomDTO.setId(1L);
        testRoomDTO.setRoomNumber(101);
        testRoomDTO.setType(RoomType.SINGLE);
        testRoomDTO.setPricePerNight(BigDecimal.valueOf(100));
        testRoomDTO.setCapacity(2);
    }

    @Test
    void getRoomById_WithExistingId_ShouldReturnRoom() {
        // Arrange
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(modelMapper.map(testRoom, RoomDTO.class)).thenReturn(testRoomDTO);

        // Act
        Response response = roomService.getRoomById(1L);

        // Assert
        assertEquals(200, response.getStatus());
        assertNotNull(response.getRoom());
    }

    @Test
    void getRoomById_WithNonExistingId_ShouldThrowException() {
        // Arrange
        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> {
            roomService.getRoomById(99L);
        });
    }

    @Test
    void getAllRooms_ShouldReturnAllRooms() {
        // Arrange
        List<Room> rooms = Arrays.asList(testRoom);
        when(roomRepository.findAll(Sort.by(Sort.Direction.DESC, "id"))).thenReturn(rooms);
        when(modelMapper.map(rooms, new TypeToken<List<RoomDTO>>() {}.getType()))
                .thenReturn(Collections.singletonList(testRoomDTO));


        // Act
        Response response = roomService.getAllRooms();

        // Assert
        assertEquals(200, response.getStatus());
        assertEquals(1, response.getRooms().size());
    }

    @Test
    void deleteRoom_WithExistingId_ShouldDeleteSuccessfully() {
        // Arrange
        when(roomRepository.existsById(1L)).thenReturn(true);

        // Act
        Response response = roomService.deleteRoom(1L);

        // Assert
        assertEquals(200, response.getStatus());
        verify(roomRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteRoom_WithNonExistingId_ShouldThrowException() {
        // Arrange
        when(roomRepository.existsById(99L)).thenReturn(false);

        // Act & Assert
        assertThrows(NotFoundException.class, () -> {
            roomService.deleteRoom(99L);
        });
    }
}