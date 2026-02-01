package com.socialnetwork; // OJO: Verifica que esto coincida con tu carpeta real

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
// 👇 ESTO ES ESTÁNDAR: Le dice explícitamente "Escanea todo bajo com.socialnetwork"
@ComponentScan(basePackages = "com.socialnetwork") 
public class SocialNetworkApplication {

    public static void main(String[] args) {
        SpringApplication.run(SocialNetworkApplication.class, args);
    }
}