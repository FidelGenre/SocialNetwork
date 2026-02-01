package com.socialnetwork.controller;

import com.socialnetwork.entity.User;
import com.socialnetwork.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(
    origins = {"https://socialnetworkclient-oyjw.onrender.com", "http://localhost:3000"},
    methods = {RequestMethod.POST, RequestMethod.OPTIONS},
    allowedHeaders = "*",
    allowCredentials = "true" // Importante para la sesión
)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager; // El jefe de seguridad

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        try {
            // 1. INTENTO DE LOGIN REAL EN SPRING SECURITY
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(), 
                    loginRequest.getPassword()
                )
            );

            // 2. Si funciona, guardamos la sesión en el contexto
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 3. Devolvemos los datos del usuario para el frontend
            User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();
            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
        }
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