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
@CrossOrigin(
    origins = {"https://socialnetworkserver-0ipr.onrender.com", "http://localhost:3000"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowedHeaders = "*"
)
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityRepository activityRepository;

    private final Path root = Paths.get("uploads");

    // 1. OBTENER USUARIO POR USERNAME (Para ver perfiles)
    @GetMapping("/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable("username") String username) {
        return userRepository.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 2. SEGUIR / DEJAR DE SEGUIR (VERSIÓN ROBUSTA)
    @PostMapping("/{targetUsername}/follow")
    @Transactional // Mantiene la consistencia de la base de datos
    public ResponseEntity<?> followUser(
            @PathVariable("targetUsername") String targetUsername,
            @RequestParam("followerUsername") String followerUsername) {
        
        // Evitar auto-follow
        if (targetUsername.equals(followerUsername)) {
            return ResponseEntity.badRequest().body("No puedes seguirte a ti mismo");
        }

        Optional<User> followerOpt = userRepository.findByUsername(followerUsername);
        Optional<User> targetOpt = userRepository.findByUsername(targetUsername);

        if (followerOpt.isPresent() && targetOpt.isPresent()) {
            User follower = followerOpt.get(); // Yo
            User target = targetOpt.get();     // El usuario al que quiero seguir

            // Verificamos si ya lo sigue
            boolean isAlreadyFollowing = follower.getFollowing().contains(target);
            
            if (isAlreadyFollowing) {
                // --- UNFOLLOW ---
                // Actualizamos AMBOS lados de la relación
                follower.getFollowing().remove(target);
                target.getFollowers().remove(follower);
                
                // Guardamos AMBOS para asegurar que JPA detecte el cambio
                userRepository.save(follower);
                userRepository.save(target);

                return ResponseEntity.ok(Map.of("message", "Dejaste de seguir a " + targetUsername, "following", false));
            } else {
                // --- FOLLOW ---
                // Actualizamos AMBOS lados
                follower.getFollowing().add(target);
                target.getFollowers().add(follower);
                
                // Guardamos AMBOS
                userRepository.save(follower);
                userRepository.save(target);
                
                // Crear notificación
                createFollowActivity(follower, target);

                return ResponseEntity.ok(Map.of("message", "Ahora sigues a " + targetUsername, "following", true));
            }
        }
        return ResponseEntity.notFound().build();
    }

    // 3. BUSCADOR DE USUARIOS
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam("q") String query) {
        return ResponseEntity.ok(userRepository.findByUsernameContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(query, query));
    }

    // 4. ACTUALIZAR PERFIL (Texto)
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

    // 5. ACTUALIZAR AVATAR (Multipart)
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
                String fileName = "avatar_" + UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Files.copy(file.getInputStream(), this.root.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

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

    // Helper para notificaciones
    private void createFollowActivity(User actor, User recipient) {
        Activity act = new Activity();
        act.setType("FOLLOW");
        act.setActor(actor);
        act.setRecipient(recipient);
        act.setCreatedAt(LocalDateTime.now());
        act.setRead(false);
        activityRepository.save(act);
    }
}