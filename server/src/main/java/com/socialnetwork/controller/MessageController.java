package com.socialnetwork.controller;

import com.socialnetwork.entity.*;
import com.socialnetwork.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173")
public class MessageController {

    @Autowired private MessageRepository messageRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ActivityRepository activityRepository;

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(
            @RequestParam("from") String from, @RequestParam("to") String to, @RequestBody String content) {
        String cleanContent = content != null ? content.replace("\"", "").trim() : "";
        User sender = userRepository.findByUsername(from).orElse(null);
        User recipient = userRepository.findByUsername(to).orElse(null);

        if (sender != null && recipient != null && !cleanContent.isEmpty()) {
            Message msg = new Message();
            msg.setSender(sender);
            msg.setRecipient(recipient);
            msg.setContent(cleanContent);
            msg.setCreatedAt(LocalDateTime.now());
            messageRepository.save(msg);

            Activity act = new Activity();
            act.setType("MESSAGE");
            act.setActor(sender);
            act.setRecipient(recipient);
            act.setCreatedAt(LocalDateTime.now());
            act.setRead(false);
            activityRepository.save(act);
            return ResponseEntity.ok(msg);
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/conversation")
    public ResponseEntity<List<Message>> getChat(
            @RequestParam("user1") String u1, @RequestParam("user2") String u2) {
        User user1 = userRepository.findByUsername(u1).orElse(null);
        User user2 = userRepository.findByUsername(u2).orElse(null);
        return (user1 != null && user2 != null) ? 
            ResponseEntity.ok(messageRepository.findConversation(user1, user2)) : 
            ResponseEntity.notFound().build();
    }

    @GetMapping("/contacts/{username}")
    public ResponseEntity<List<User>> getContacts(@PathVariable("username") String username) {
        return ResponseEntity.ok(messageRepository.findChatPartners(username));
    }

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

    @PatchMapping("/read")
    public ResponseEntity<?> markMessagesAsRead(
            @RequestParam("username") String username, @RequestParam("from") String from) {
        List<Activity> unread = activityRepository.findByRecipientUsernameAndTypeAndActorUsernameAndIsReadFalse(
                username, "MESSAGE", from);
        unread.forEach(a -> a.setRead(true));
        activityRepository.saveAll(unread);
        return ResponseEntity.ok().build();
    }
}