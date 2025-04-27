package com.example.HotelBooking.services;

import com.example.HotelBooking.dtos.*;
import com.example.HotelBooking.entities.User;
import com.example.HotelBooking.enums.UserRole;
import com.example.HotelBooking.exceptions.InvalidCredentialException;
import com.example.HotelBooking.exceptions.NotFoundException;
import com.example.HotelBooking.repositories.UserRepository;
import com.example.HotelBooking.security.JwtUtils;
import com.example.HotelBooking.services.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;
    private RegistrationRequest testRegistrationRequest;
    private LoginRequest testLoginRequest;
    private UserDTO testUserDTO;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encodedPassword")
                .firstName("Test")
                .lastName("User")
                .phoneNumber("123456789")
                .role(UserRole.CUSTOMER)
                .isActive(true)
                .build();

        testRegistrationRequest = new RegistrationRequest();
        testRegistrationRequest.setEmail("test@example.com");
        testRegistrationRequest.setPassword("password");
        testRegistrationRequest.setFirstName("Test");
        testRegistrationRequest.setLastName("User");
        testRegistrationRequest.setPhoneNumber("123456789");

        testLoginRequest = new LoginRequest();
        testLoginRequest.setEmail("test@example.com");
        testLoginRequest.setPassword("password");

        testUserDTO = UserDTO.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .phoneNumber("123456789")
                .role(UserRole.CUSTOMER)
                .isActive(true)
                .build();
    }

    @Test
    void registerUser_WithValidData_ShouldReturnSuccess() {
        // Arrange
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        Response response = userService.registerUser(testRegistrationRequest);

        // Assert
        assertEquals(200, response.getStatus());
        assertEquals("Usuário criado com sucesso", response.getMessage());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void loginUser_WithValidCredentials_ShouldReturnToken() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);
        when(jwtUtils.generateToken("test@example.com")).thenReturn("testToken");

        // Act
        Response response = userService.loginUser(testLoginRequest);

        // Assert
        assertEquals(200, response.getStatus());
        assertEquals("Usuário efetuou login com sucesso", response.getMessage());
        assertEquals("testToken", response.getToken());
    }

    @Test
    void loginUser_WithNonExistingEmail_ShouldThrowException() {
        // Arrange
        when(userRepository.findByEmail("nonexisting@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> {
            LoginRequest request = new LoginRequest();
            request.setEmail("nonexisting@example.com");
            request.setPassword("password");
            userService.loginUser(request);
        });
    }

    @Test
    void getCurrentLoggedInUser_WithAuthenticatedUser_ShouldReturnUser() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        SecurityContextHolder.getContext().setAuthentication(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "test@example.com", null));

        // Act
        User user = userService.getCurrentLoggedInUser();

        // Assert
        assertNotNull(user);
        assertEquals("test@example.com", user.getEmail());
    }

    @Test
    void updateOwnAccount_WithValidData_ShouldUpdateSuccessfully() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        SecurityContextHolder.getContext().setAuthentication(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "test@example.com", null));

        UserDTO updateDTO = new UserDTO();
        updateDTO.setFirstName("Updated");
        updateDTO.setLastName("Name");
        updateDTO.setPhoneNumber("987654321");
        updateDTO.setPassword("newPassword");

        when(passwordEncoder.encode("newPassword")).thenReturn("newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        Response response = userService.updateOwnAccount(updateDTO);

        // Assert
        assertEquals(200, response.getStatus());
        assertEquals("Usuário atualizado com sucesso", response.getMessage());
        verify(userRepository, times(1)).save(any(User.class));
    }
}