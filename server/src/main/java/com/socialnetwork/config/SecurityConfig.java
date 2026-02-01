package com.socialnetwork.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Desactivar CSRF (necesario para APIs REST/JSON)
            .csrf(csrf -> csrf.disable())
            // 2. Configurar CORS explícitamente
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 3. Definir rutas públicas y privadas
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll() // DEJA PASAR LOGIN Y REGISTER
                .requestMatchers("/api/public/**").permitAll() // Otros endpoints públicos si tienes
                .anyRequest().authenticated() // Todo lo demás requiere token
            );
        
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // OJO: Aquí pongo la URL exacta de tu frontend que vi en la captura
        configuration.setAllowedOrigins(Arrays.asList("https://socialnetworkclient-oyjw.onrender.com", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}