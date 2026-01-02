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
                // Aplicamos la configuración a todas las rutas que empiecen con /api/
                registry.addMapping("/api/**")
                        // Autorizamos el frontend en Render y el entorno local de desarrollo
                        .allowedOrigins(
                            "https://socialnetwork-m3m4.onrender.com"
                        )
                        // Incluimos PATCH (necesario para likes y notificaciones leídas)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                        .allowedHeaders("*")
                        // Importante si en el futuro decides usar Cookies o Sesiones
                        .allowCredentials(true);
            }
        };
    }
}