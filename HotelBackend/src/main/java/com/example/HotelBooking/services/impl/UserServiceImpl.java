package com.example.HotelBooking.services.impl;

import com.example.HotelBooking.dtos.*;
import com.example.HotelBooking.entities.Booking;
import com.example.HotelBooking.entities.User;
import com.example.HotelBooking.enums.UserRole;
import com.example.HotelBooking.exceptions.InvalidCredentialException;
import com.example.HotelBooking.exceptions.NotFoundException;
import com.example.HotelBooking.repositories.BookingRepository;
import com.example.HotelBooking.repositories.UserRepository;
import com.example.HotelBooking.security.JwtUtils;
import com.example.HotelBooking.services.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final ModelMapper modelMapper;
    private final BookingRepository bookingRepository;


    @Override
    public Response registerUser(RegistrationRequest registrationRequest) {
        UserRole role = UserRole.CUSTOMER;

        if (registrationRequest.getRole() != null) {
            role = registrationRequest.getRole();
        }

        User userToSave = User.builder()
                .firstName(registrationRequest.getFirstName())
                .lastName(registrationRequest.getLastName())
                .email(registrationRequest.getEmail())
                .password(passwordEncoder.encode(registrationRequest.getPassword()))
                .phoneNumber(registrationRequest.getPhoneNumber())
                .role(role)
                .isActive(Boolean.TRUE)
                .build();

        userRepository.save(userToSave);

        return Response.builder()
                .status(200)
                .message("Usuário criado com sucesso")
                .build();

    }

    @Override
    public Response loginUser(LoginRequest loginRequest) {
       User user = userRepository.findByEmail(loginRequest.getEmail())
               .orElseThrow(()-> new NotFoundException("E-mail não encontrado"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new InvalidCredentialException("A senha não corresponde");
        }

        String token = jwtUtils.generateToken(user.getEmail());


        return Response.builder()
                .status(200)
                .message("Usuário efetuou login com sucesso")
                .role(user.getRole())
                .token(token)
                .isActive(user.getIsActive())
                .expirationTime("6 months")
                .build();
    }

    @Override
    public Response getAllUsers() {
        List<User> users = userRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));

        List<UserDTO> userDTOList = modelMapper.map(users, new TypeToken<List<UserDTO>>(){}.getType());

        return Response.builder()
                .status(200)
                .message("success")
                .users(userDTOList)
                .build();
    }

    @Override
    public Response getOwnAccountDetails() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(()-> new NotFoundException("Usuário não encontrado"));


        log.info("Dentro do getOwnAccountDetails o e-mail do usuário é {}", email);

        UserDTO userDTO = modelMapper.map(user, UserDTO.class);

        return Response.builder()
                .status(200)
                .message("success")
                .user(userDTO)
                .build();
    }

    @Override
    public User getCurrentLoggedInUser() {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return userRepository.findByEmail(email)
                .orElseThrow(()-> new NotFoundException("Usuário não encontrado"));
    }

    @Override
    public Response updateOwnAccount(UserDTO userDTO) {
       User existingUser = getCurrentLoggedInUser();
       log.info("Atualização interna do usuário");

        if (userDTO.getEmail() != null) existingUser.setEmail(userDTO.getEmail());
        if (userDTO.getFirstName() != null) existingUser.setFirstName(userDTO.getFirstName());
        if (userDTO.getLastName() != null) existingUser.setLastName(userDTO.getLastName());
        if (userDTO.getPhoneNumber() != null) existingUser.setPhoneNumber(userDTO.getPhoneNumber());

        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }
        userRepository.save(existingUser);

        return Response.builder()
                .status(200)
                .message("Usuário atualizado com sucesso")
                .build();
    }

    @Override
    public Response deleteOwnAccount() {
        User user = getCurrentLoggedInUser();
        userRepository.delete(user);

        return Response.builder()
                .status(200)
                .message("Usuário excluído com sucesso")
                .build();
    }

    @Override
    public Response getMyBookingHistory() {
        try {
            User user = getCurrentLoggedInUser();
            var projections = bookingRepository.findBookingHistoryByUserId(user.getId());
            List<BookingDTO> bookingDTOList = projections.stream().map(p -> BookingDTO.builder()
                    .id(p.getId())
                    .checkInDate(p.getCheckInDate())
                    .checkOutDate(p.getCheckOutDate())
                    .totalPrice(p.getTotalPrice())
                    .bookingReference(p.getBookingReference())
                    .createdAt(p.getCreatedAt())
                    .bookingStatus(p.getBookingStatus())
                    .paymentStatus(p.getPaymentStatus())
                    .room(com.example.HotelBooking.dtos.RoomDTO.builder()
                            .id(p.getRoomId())
                            .roomNumber(p.getRoomNumber())
                            .type(p.getRoomType())
                            .pricePerNight(p.getRoomPricePerNight())
                            .capacity(p.getRoomCapacity())
                            .description(p.getRoomDescription())
                            .title(p.getRoomTitle())
                            .imageUrl("/api/rooms/" + p.getRoomId() + "/image")
                            .build())
                    .build()
            ).toList();
            return Response.builder()
                .status(200)
                .message("Histórico de reservas recuperado com sucesso")
                .bookings(bookingDTOList)
                .build();
        } catch (Exception e) {
            log.error("Erro ao buscar histórico de reservas: ", e);
            return Response.builder()
                .status(500)
                .message("Erro ao buscar histórico de reservas: " + e.getMessage())
                .build();
        }
    }

}
