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
            // 1. Activamos CORS usando la configuración de abajo
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 2. Desactivamos CSRF (necesario para que funcione el POST de login desde otro dominio)
            .csrf(csrf -> csrf.disable()) 
            
            .authorizeHttpRequests(auth -> auth
                // Permite acceso libre a login y registro (ajusta las rutas si las tuyas son distintas)
                .requestMatchers("/auth/**", "/api/auth/**").permitAll() 
                // El resto de rutas requieren estar logueado (si usas tokens o sesiones)
                .anyRequest().authenticated() 
            );
            
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // AQUÍ AUTORIZAMOS A TU FRONTEND
        configuration.setAllowedOrigins(Arrays.asList(
            "https://socialnetworkclient-oyjw.onrender.com", // <--- Tu frontend en prod
            "http://localhost:3000" // Tu local
        ));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}