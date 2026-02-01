package com.socialnetwork; // <--- Asegúrate de que esto coincida con tu carpeta actual

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
@EnableWebSecurity // <--- ESTO ES CRÍTICO
public class SocialNetworkApplication {

    public static void main(String[] args) {
        SpringApplication.run(SocialNetworkApplication.class, args);
    }

    // --- CONFIGURACIÓN DE SEGURIDAD INTEGRADA (A prueba de fallos) ---

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Desactivar CSRF para que el POST de login funcione
            .csrf(csrf -> csrf.disable())
            // 2. Habilitar CORS para que tu Next.js pueda hablar con Java
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 3. Reglas de acceso
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll() // Login y Registro: PÚBLICOS
                .requestMatchers("/").permitAll()        // Health Check: PÚBLICO
                .anyRequest().authenticated()            // Todo lo demás: PRIVADO
            );
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Permitir explícitamente tu frontend en Render
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