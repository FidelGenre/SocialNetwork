package com.socialnetwork; // OJO: Verifica que esto coincida con lo que tienes

import com.socialnetwork.config.SecurityConfig; // <--- IMPORTA TU CLASE CONFIG
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import; // <--- NECESARIO

@SpringBootApplication
@Import(SecurityConfig.class) // <--- ESTA ES LA CLAVE. FORZAMOS LA CARGA.
public class SocialNetworkApplication {

    public static void main(String[] args) {
        SpringApplication.run(SocialNetworkApplication.class, args);
    }
}