package com.example.HotelBooking.services.impl;

import com.example.HotelBooking.dtos.Response;
import com.example.HotelBooking.dtos.RoomDTO;
import com.example.HotelBooking.entities.Room;
import com.example.HotelBooking.enums.RoomType;
import com.example.HotelBooking.exceptions.InvalidBookingStateAndDateException;
import com.example.HotelBooking.exceptions.NotFoundException;
import com.example.HotelBooking.repositories.RoomRepository;
import com.example.HotelBooking.services.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final ModelMapper modelMapper;

    @Override
    public Response addRoom(RoomDTO roomDTO, MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            throw new IllegalArgumentException("Upload de arquivos não é suportado. Por favor, forneça uma URL de imagem.");
        }

        validateImageUrl(roomDTO.getImageUrl());

        Room roomToSave = modelMapper.map(roomDTO, Room.class);
        roomRepository.save(roomToSave);

        return Response.builder()
                .status(200)
                .message("Quarto adicionado com sucesso")
                .build();
    }

    @Override
    public Response updateRoom(RoomDTO roomDTO, MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            throw new IllegalArgumentException("Upload de arquivos não é suportado. Por favor, forneça uma URL de imagem.");
        }

        validateImageUrl(roomDTO.getImageUrl());

        Room existingRoom = roomRepository.findById(roomDTO.getId())
                .orElseThrow(() -> new NotFoundException("Quarto não encontrado"));

        existingRoom.setImageUrl(roomDTO.getImageUrl());

        if (roomDTO.getRoomNumber() != null && roomDTO.getRoomNumber() >= 0) {
            existingRoom.setRoomNumber(roomDTO.getRoomNumber());
        }

        if (roomDTO.getPricePerNight() != null && roomDTO.getPricePerNight().compareTo(BigDecimal.ZERO) >= 0) {
            existingRoom.setPricePerNight(roomDTO.getPricePerNight());
        }

        if (roomDTO.getCapacity() != null && roomDTO.getCapacity() > 0) {
            existingRoom.setCapacity(roomDTO.getCapacity());
        }

        if (roomDTO.getType() != null) {
            existingRoom.setType(roomDTO.getType());
        }

        if (roomDTO.getDescription() != null) {
            existingRoom.setDescription(roomDTO.getDescription());
        }

        if (roomDTO.getTitle() != null) {
            existingRoom.setTitle(roomDTO.getTitle());
        }

        roomRepository.save(existingRoom);

        return Response.builder()
                .status(200)
                .message("Quarto atualizado com sucesso")
                .build();
    }

    @Override
    public Response getAllRooms() {
        List<Room> roomList = roomRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        List<RoomDTO> roomDTOList = modelMapper.map(roomList, new TypeToken<List<RoomDTO>>() {}.getType());

        return Response.builder()
                .status(200)
                .message("success")
                .rooms(roomDTOList)
                .build();
    }

    @Override
    public Response getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Quarto não encontrado"));

        RoomDTO roomDTO = modelMapper.map(room, RoomDTO.class);

        return Response.builder()
                .status(200)
                .message("success")
                .room(roomDTO)
                .build();
    }

    @Override
    public Response deleteRoom(Long id) {
        if (!roomRepository.existsById(id)) {
            throw new NotFoundException("Quarto não encontrado");
        }
        roomRepository.deleteById(id);

        return Response.builder()
                .status(200)
                .message("Quarto deletado com sucesso!")
                .build();
    }

    @Override
    public Response getAvailableRooms(LocalDate checkInDate, LocalDate checkOutDate, RoomType roomType) {
        if (checkInDate.isBefore(LocalDate.now())) {
            throw new InvalidBookingStateAndDateException("A data de check-in não pode ser antes de hoje");
        }

        if (checkOutDate.isBefore(checkInDate)) {
            throw new InvalidBookingStateAndDateException("A data de check-out não pode ser anterior à data de check-in ");
        }

        if (checkInDate.isEqual(checkOutDate)) {
            throw new InvalidBookingStateAndDateException("A data de check-in não pode ser igual à data de check-out");
        }

        List<Room> roomList = roomRepository.findAvailableRooms(checkInDate, checkOutDate, roomType);
        List<RoomDTO> roomDTOList = modelMapper.map(roomList, new TypeToken<List<RoomDTO>>() {}.getType());

        return Response.builder()
                .status(200)
                .message("success")
                .rooms(roomDTOList)
                .build();
    }

    @Override
    public List<RoomType> getAllRoomTypes() {
        return Arrays.asList(RoomType.values());
    }

    @Override
    public Response searchRoom(String input) {
        List<Room> roomList = roomRepository.searchRooms(input);
        List<RoomDTO> roomDTOList = modelMapper.map(roomList, new TypeToken<List<RoomDTO>>() {}.getType());

        return Response.builder()
                .status(200)
                .message("success")
                .rooms(roomDTOList)
                .build();
    }

    private void validateImageUrl(String imageUrl) {
        if (imageUrl != null && !imageUrl.isBlank()) {
            try {
                // Verifica se é uma URL válida
                new URL(imageUrl);

                // Verifica se começa com http:// ou https://
                if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
                    throw new IllegalArgumentException("URL deve começar com http:// ou https://");
                }

            } catch (MalformedURLException e) {
                throw new IllegalArgumentException("URL da imagem inválida: " + e.getMessage());
            }
        }
    }
}