package com.socialnetwork.controller;

import com.socialnetwork.entity.User;
import com.socialnetwork.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
/**
 * CONFIGURACIÓN DE CORS:
 * Permite peticiones desde tu frontend en Render y desde tu entorno local (Vite).
 * Soporta los métodos necesarios para la autenticación y las pre-consultas del navegador.
 */
@CrossOrigin(
    origins = {"https://socialnetwork-m3m4.onrender.com", "http://localhost:3000"},
    methods = {RequestMethod.POST, RequestMethod.OPTIONS},
    allowedHeaders = "*"
)
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        // Buscamos al usuario por nombre de usuario en PostgreSQL
        return userRepository.findByUsername(loginRequest.getUsername())
            .map(user -> {
                // Validación de seguridad contra nulos
                if (user.getPassword() != null && user.getPassword().equals(loginRequest.getPassword())) {
                    // Retornamos el usuario si la contraseña coincide
                    return ResponseEntity.ok(user);
                }
                return ResponseEntity.status(401).body(Map.of("error", "Contraseña incorrecta"));
            })
            .orElse(ResponseEntity.status(401).body(Map.of("error", "Usuario no encontrado")));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // Verificamos si el nombre de usuario ya existe para evitar duplicados
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.status(400).body(Map.of("error", "El nombre de usuario ya existe"));
        }
        
        // Guardamos el nuevo usuario en la base de datos PostgreSQL de Render
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }
}