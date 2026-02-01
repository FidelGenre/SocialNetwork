package com.socialnetwork; // Asegúrate que este package sea correcto

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
// ESTO ES CRÍTICO: Obliga a Spring a buscar en todas las carpetas que empiecen por com.socialnetwork
@ComponentScan(basePackages = "com.socialnetwork") 
public class SocialNetworkApplication {

    public static void main(String[] args) {
        SpringApplication.run(SocialNetworkApplication.class, args);
    }
}