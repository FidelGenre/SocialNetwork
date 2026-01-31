package com.socialnetwork.controller;

import com.socialnetwork.entity.*;
import com.socialnetwork.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/messages")
/**
 * CONFIGURACIÓN DE CORS:
 * Autoriza el origen de producción en Render y el local de Vite.
 * Se incluye PATCH para la funcionalidad de "marcar como leído".
 */
@CrossOrigin(
    origins = {"https://socialnetworkserver-0ipr.onrender.com", "http://localhost:3000"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PATCH, RequestMethod.OPTIONS},
    allowedHeaders = "*"
)
public class MessageController {

    @Autowired private MessageRepository messageRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ActivityRepository activityRepository;

    // 1. ENVIAR MENSAJE
    @PostMapping("/send")
    @Transactional
    public ResponseEntity<?> sendMessage(
            @RequestParam("from") String from, 
            @RequestParam("to") String to, 
            @RequestBody String content) {
        
        // Limpieza de caracteres extra si el frontend envía el string con comillas
        String cleanContent = content != null ? content.replace("\"", "").trim() : "";
        
        User sender = userRepository.findByUsername(from).orElse(null);
        User recipient = userRepository.findByUsername(to).orElse(null);

        if (sender != null && recipient != null && !cleanContent.isEmpty()) {
            // Guardar el mensaje en PostgreSQL
            Message msg = new Message();
            msg.setSender(sender);
            msg.setRecipient(recipient);
            msg.setContent(cleanContent);
            msg.setCreatedAt(LocalDateTime.now());
            messageRepository.save(msg);

            // Crear notificación de tipo MESSAGE
            Activity act = new Activity();
            act.setType("MESSAGE");
            act.setActor(sender);
            act.setRecipient(recipient);
            act.setCreatedAt(LocalDateTime.now());
            act.setRead(false);
            activityRepository.save(act);
            
            return ResponseEntity.ok(msg);
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Datos de mensaje inválidos"));
    }

    // 2. OBTENER CONVERSACIÓN ENTRE DOS USUARIOS
    @GetMapping("/conversation")
    public ResponseEntity<List<Message>> getChat(
            @RequestParam("user1") String u1, @RequestParam("user2") String u2) {
        
        User user1 = userRepository.findByUsername(u1).orElse(null);
        User user2 = userRepository.findByUsername(u2).orElse(null);
        
        if (user1 != null && user2 != null) {
            return ResponseEntity.ok(messageRepository.findConversation(user1, user2));
        }
        return ResponseEntity.notFound().build();
    }

    // 3. LISTADO DE CONTACTOS (Personas con las que se ha chateado)
    @GetMapping("/contacts/{username}")
    public ResponseEntity<List<User>> getContacts(@PathVariable("username") String username) {
        return ResponseEntity.ok(messageRepository.findChatPartners(username));
    }

    // 4. CONTAR MENSAJES NO LEÍDOS POR CONTACTO
    @GetMapping("/unread-counts/{username}")
    public ResponseEntity<Map<String, Long>> getUnreadCounts(@PathVariable("username") String username) {
        List<User> partners = messageRepository.findChatPartners(username);
        Map<String, Long> counts = new HashMap<>();
        
        for (User p : partners) {
            long count = activityRepository.countByRecipientUsernameAndActorUsernameAndTypeAndIsReadFalse(
                username, p.getUsername(), "MESSAGE");
            counts.put(p.getUsername(), count);
        }
        return ResponseEntity.ok(counts);
    }

    // 5. MARCAR MENSAJES COMO LEÍDOS
    @PatchMapping("/read")
    @Transactional
    public ResponseEntity<?> markMessagesAsRead(
            @RequestParam("username") String username, 
            @RequestParam("from") String from) {
        
        List<Activity> unread = activityRepository.findByRecipientUsernameAndTypeAndActorUsernameAndIsReadFalse(
                username, "MESSAGE", from);
        
        unread.forEach(a -> a.setRead(true));
        activityRepository.saveAll(unread);
        
        return ResponseEntity.ok(Map.of("message", "Mensajes marcados como leídos"));
    }
}