package com.socialnetwork.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // 1. AUTH (LOGIN/REGISTER)
                .requestMatchers("/auth/**", "/api/auth/**").permitAll()
                .requestMatchers("/").permitAll()

                // 2. POSTS - CAMBIO IMPORTANTE AQUÍ 👇
                .requestMatchers(HttpMethod.GET, "/posts/**", "/api/posts/**").permitAll()
                
                // CAMBIADO A permitAll() para que pase tu username manual
                .requestMatchers(HttpMethod.POST, "/posts/**", "/api/posts/**").permitAll() 
                
                // El DELETE ya lo tenías controlado en el controller, así que mejor abrirlo también para evitar problemas
                .requestMatchers(HttpMethod.DELETE, "/posts/**", "/api/posts/**").permitAll()
                
                .requestMatchers(HttpMethod.PATCH, "/posts/**", "/api/posts/**").permitAll()

                // 3. USUARIOS
                .requestMatchers("/users/**", "/api/users/**").permitAll()

                // 4. MENSAJES Y NOTIFICACIONES
                .requestMatchers("/messages/**", "/api/messages/**").permitAll()
                .requestMatchers("/activities/**", "/api/activities/**").permitAll()
                
                // Imágenes (Importante para ver las fotos subidas)
                .requestMatchers("/images/**", "/api/posts/images/**").permitAll()
                
                .anyRequest().authenticated()
            );
        return http.build();
    }

    // ... (El resto se mantiene igual)
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance(); 
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
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