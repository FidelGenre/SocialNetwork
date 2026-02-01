package com.socialnetwork; // <--- Tu paquete raíz

import com.socialnetwork.config.SecurityConfig; // <--- IMPORTA TU CLASE (Si esto da error, el paquete está mal)
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import; // <--- Necesario

@SpringBootApplication
@Import(SecurityConfig.class) // <--- OBLIGAMOS A SPRING A LEERLO
public class SocialNetworkApplication {

    public static void main(String[] args) {
        SpringApplication.run(SocialNetworkApplication.class, args);
    }
}