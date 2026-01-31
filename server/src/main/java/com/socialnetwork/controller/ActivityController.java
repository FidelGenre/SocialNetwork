package com.socialnetwork.controller;

import com.socialnetwork.entity.Activity;
import com.socialnetwork.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activities")
/**
 * CONFIGURACIÓN DE CORS:
 * Autoriza el frontend de Render y el local de Vite.
 * Incluye PATCH para marcar notificaciones como leídas.
 */
@CrossOrigin(
    origins = {"https://socialnetwork-m3m4.onrender.com", "http://localhost:3000"},
    methods = {RequestMethod.GET, RequestMethod.PATCH, RequestMethod.OPTIONS},
    allowedHeaders = "*"
)
public class ActivityController {

    @Autowired
    private ActivityRepository activityRepository;

    // 1. OBTENER TODAS LAS NOTIFICACIONES DE UN USUARIO
    @GetMapping("/{username}")
    public ResponseEntity<List<Activity>> getActivities(@PathVariable("username") String username) {
        // Devuelve las notificaciones ordenadas por fecha (más recientes primero)
        return ResponseEntity.ok(activityRepository.findByRecipientUsernameOrderByCreatedAtDesc(username));
    }

    // 2. MARCAR NOTIFICACIONES COMO LEÍDAS (Por tipo)
    @PatchMapping("/read")
    @Transactional
    public ResponseEntity<?> markAsRead(
            @RequestParam("username") String username, 
            @RequestParam("type") String type) {
        
        List<Activity> unread;
        
        // Separamos la lógica: notificaciones de chat vs notificaciones generales (Likes, Follows, Reposts)
        if ("MESSAGE".equals(type)) {
            unread = activityRepository.findByRecipientUsernameAndTypeAndIsReadFalse(username, "MESSAGE");
        } else {
            unread = activityRepository.findByRecipientUsernameAndTypeNotAndIsReadFalse(username, "MESSAGE");
        }

        unread.forEach(a -> a.setRead(true));
        activityRepository.saveAll(unread);
        
        return ResponseEntity.ok(Map.of("message", "Notificaciones marcadas como leídas"));
    }
}