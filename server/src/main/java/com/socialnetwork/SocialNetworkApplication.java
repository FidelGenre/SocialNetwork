package com.socialnetwork; // Asegúrate de que no diga "example"

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SocialNetworkApplication {
    public static void main(String[] args) {
        // ERROR AQUÍ: Debe ser SocialNetworkApplication (con N mayúscula)
        SpringApplication.run(SocialNetworkApplication.class, args);
    }
}