package com.socialnetwork; // <--- ASEGÚRATE DE QUE ESTE NOMBRE COINCIDA CON TU CARPETA

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@SpringBootApplication
@EnableWebSecurity // <--- ESTO DESACTIVA EL PASSWORD GENERADO
public class SocialNetworkApplication {

    public static void main(String[] args) {
        SpringApplication.run(SocialNetworkApplication.class, args);
    }

    // --- SEGURIDAD INCRUSTADA ---

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Permite POST de Login
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Permite conexión de Next.js
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll() // Login PÚBLICO
                .requestMatchers("/").permitAll()        // Health Check PÚBLICO
                .anyRequest().authenticated()
            );
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // URLs permitidas
        configuration.setAllowedOrigins(Arrays.asList(
            "https://socialnetworkclient-oyjw.onrender.com", 
            "http://localhost:3000"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}