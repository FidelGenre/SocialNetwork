package com.socialnetwork.controller;

import com.socialnetwork.entity.User;
import com.socialnetwork.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
// Asegúrate de que este puerto coincida con tu Vite (5173 según tu terminal)
@CrossOrigin(origins = "http://localhost:5173") 
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        // Buscamos al usuario por nombre de usuario
        return userRepository.findByUsername(loginRequest.getUsername())
            .map(user -> {
                // Validación de seguridad contra nulos para evitar el NullPointerException
                if (user.getPassword() != null && user.getPassword().equals(loginRequest.getPassword())) {
                    return ResponseEntity.ok(user);
                }
                return ResponseEntity.status(401).body("Contraseña incorrecta");
            })
            .orElse(ResponseEntity.status(401).body("Usuario no encontrado"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // Verificamos si el nombre de usuario ya está tomado
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.status(400).body("El nombre de usuario ya existe");
        }
        
        // Guardamos el nuevo usuario en la base de datos H2
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }
}