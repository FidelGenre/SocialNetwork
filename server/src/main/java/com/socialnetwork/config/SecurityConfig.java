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
@EnableWebSecurity // <--- ESTA ETIQUETA ELIMINA LA CONTRASEÑA GENERADA
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Desactivar CSRF: Obligatorio para que funcione el POST de Login desde React/Next.js
            .csrf(csrf -> csrf.disable())
            
            // 2. Conectar CORS: Le decimos a seguridad que use la configuración de abajo
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 3. Reglas de acceso (Quién puede entrar)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll() // LOGIN Y REGISTRO PÚBLICOS
                .requestMatchers("/").permitAll()        // HEALTH CHECK PÚBLICO
                .anyRequest().authenticated()            // EL RESTO PRIVADO
            );
            
        return http.build();
    }

    // Esta configuración REEMPLAZA a tu WebConfig.java
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Tus URLs permitidas (Render y Local)
        configuration.setAllowedOrigins(Arrays.asList(
            "https://socialnetworkclient-oyjw.onrender.com", 
            "http://localhost:3000"
        ));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}