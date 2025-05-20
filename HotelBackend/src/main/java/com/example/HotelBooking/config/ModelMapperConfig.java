package com.example.HotelBooking.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration()
                .setFieldMatchingEnabled(true)
                .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE)
                .setMatchingStrategy(MatchingStrategies.STANDARD);

        // Mapeamento Room -> RoomSummaryDTO (sem imageData)
        modelMapper.typeMap(com.example.HotelBooking.entities.Room.class, com.example.HotelBooking.dtos.RoomSummaryDTO.class);

        return modelMapper;
    }

}
