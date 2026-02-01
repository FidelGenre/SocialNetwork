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
@EnableWebSecurity // <--- ESTA ETIQUETA ES LA QUE QUITA LA CONTRASEÑA GENERADA
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Desactiva la protección anti-formularios (necesario para React/Next)
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Activa tu configuración de dominios
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll() // DEJA PASAR LOGIN/REGISTER
                .requestMatchers("/").permitAll()        // DEJA PASAR HEALTH CHECK
                .anyRequest().authenticated()
            );
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Permite tu frontend de Render y tu Localhost
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