package com.socialnetwork.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // 1. CAMBIO IMPORTANTE: Usamos "/**" para que cubra TODO (incluido /auth y /api)
                registry.addMapping("/**")
                        // 2. CAMBIO IMPORTANTE: Aquí va la URL de tu FRONTEND (Client), no la del server
                        .allowedOrigins(
                            "https://socialnetworkclient-oyjw.onrender.com", // <--- Esta es la URL de tu web
                            "http://localhost:3000" // Para cuando pruebas en tu PC
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}