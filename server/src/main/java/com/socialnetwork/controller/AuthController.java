package com.socialnetwork.controller;

import com.socialnetwork.entity.User;
import com.socialnetwork.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
// 1. CORRECCIÓN CLAVE: Quitamos "/api" para que coincida con SecurityConfig ("/auth/**")
@RequestMapping("/auth") 
@CrossOrigin(
    // 2. CORRECCIÓN CLAVE: Aquí debe ir la URL de tu CLIENTE (Frontend), no la del servidor
    origins = {"https://socialnetworkclient-oyjw.onrender.com", "http://localhost:3000"},
    methods = {RequestMethod.POST, RequestMethod.OPTIONS},
    allowedHeaders = "*"
)
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        // NOTA: Este login busca en la BASE DE DATOS, no usa el usuario 'admin' de memoria.
        // Tienes que registrarte primero.
        return userRepository.findByUsername(loginRequest.getUsername())
            .map(user -> {
                if (user.getPassword() != null && user.getPassword().equals(loginRequest.getPassword())) {
                    return ResponseEntity.ok(user);
                }
                return ResponseEntity.status(401).body(Map.of("error", "Contraseña incorrecta"));
            })
            .orElse(ResponseEntity.status(401).body(Map.of("error", "Usuario no encontrado")));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.status(400).body(Map.of("error", "El nombre de usuario ya existe"));
        }
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }
}