package com.socialnetwork; 

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// 👇 ESTA LÍNEA ES LA SOLUCIÓN DEFINITIVA 👇
// Obliga a Spring a buscar tu SecurityConfig en todo el paquete "com.socialnetwork"
@SpringBootApplication(scanBasePackages = "com.socialnetwork") 
public class SocialNetworkApplication {

    public static void main(String[] args) {
        SpringApplication.run(SocialNetworkApplication.class, args);
    }
}