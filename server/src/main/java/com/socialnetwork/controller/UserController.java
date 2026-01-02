package com.socialnetwork.controller;

import com.socialnetwork.entity.Activity;
import com.socialnetwork.entity.User;
import com.socialnetwork.repository.ActivityRepository;
import com.socialnetwork.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
/**
 * CONFIGURACIÓN DE CORS: 
 * Se autoriza la URL específica de tu frontend en Render.
 * Se permiten los métodos necesarios para que el navegador no bloquee las peticiones preflight (OPTIONS).
 */
@CrossOrigin(
    origins = {"https://socialnetwork-m3m4.onrender.com"}, 
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowedHeaders = "*"
)
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityRepository activityRepository;

    // Directorio de subida (Render usa sistemas efímeros, pero esto funcionará para la sesión actual)
    private final Path root = Paths.get("uploads");

    // 1. SEGUIR / DEJAR DE SEGUIR
    @PostMapping("/{targetUsername}/follow")
    @Transactional
    public ResponseEntity<?> followUser(
            @PathVariable("targetUsername") String targetUsername, 
            @RequestParam("followerUsername") String followerUsername) {
        
        return userRepository.findByUsername(followerUsername).map(follower -> {
            return userRepository.findByUsername(targetUsername).map(target -> {
                boolean isAlreadyFollowing = follower.getFollowing().contains(target);
                
                if (isAlreadyFollowing) {
                    follower.getFollowing().remove(target);
                } else {
                    follower.getFollowing().add(target);
                    
                    // Registro de actividad de notificación
                    Activity act = new Activity();
                    act.setType("FOLLOW");
                    act.setActor(follower);
                    act.setRecipient(target);
                    act.setCreatedAt(LocalDateTime.now());
                    act.setRead(false);
                    activityRepository.save(act);
                }
                
                userRepository.save(follower);
                return ResponseEntity.ok(Map.of("following", !isAlreadyFollowing));
            }).orElse(ResponseEntity.notFound().build());
        }).orElse(ResponseEntity.status(400).build());
    }

    // 2. BUSCADOR DE USUARIOS
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam("q") String query) {
        return ResponseEntity.ok(userRepository.findByUsernameContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(query, query));
    }

    // 3. ACTUALIZAR PERFIL (Texto)
    @PutMapping("/{username}")
    public ResponseEntity<User> updateUser(
            @PathVariable("username") String username, 
            @RequestBody User details) {
        return userRepository.findByUsername(username).map(user -> {
            user.setDisplayName(details.getDisplayName());
            user.setBio(details.getBio());
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 4. ACTUALIZAR AVATAR (Multipart)
    @PatchMapping(value = "/{username}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateAvatar(
            @PathVariable("username") String username,
            @RequestParam("file") MultipartFile file) {
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        User user = userOpt.get();

        if (file != null && !file.isEmpty()) {
            try {
                if (!Files.exists(root)) Files.createDirectories(root);

                // Generar nombre único para evitar colisiones de archivos
                String fileName = "avatar_" + UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Files.copy(file.getInputStream(), this.root.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

                // El path que se guarda es el que el frontend usará para pedir la imagen
                user.setAvatarUrl("/api/posts/images/" + fileName);
                userRepository.save(user);

                return ResponseEntity.ok(user);
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error al procesar la subida del avatar");
            }
        }
        return ResponseEntity.badRequest().body("No se proporcionó ningún archivo");
    }
}