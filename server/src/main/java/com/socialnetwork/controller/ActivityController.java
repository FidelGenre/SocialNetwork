package com.socialnetwork.controller;

import com.socialnetwork.entity.Activity;
import com.socialnetwork.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "http://localhost:5173")
public class ActivityController {

    @Autowired
    private ActivityRepository activityRepository;

    @GetMapping("/{username}")
    public ResponseEntity<List<Activity>> getActivities(@PathVariable("username") String username) {
        return ResponseEntity.ok(activityRepository.findByRecipientUsernameOrderByCreatedAtDesc(username));
    }

    @PatchMapping("/read")
    public ResponseEntity<?> markAsRead(
            @RequestParam("username") String username, 
            @RequestParam("type") String type) {
        
        List<Activity> unread;
        if (type.equals("MESSAGE")) {
            unread = activityRepository.findByRecipientUsernameAndTypeAndIsReadFalse(username, "MESSAGE");
        } else {
            unread = activityRepository.findByRecipientUsernameAndTypeNotAndIsReadFalse(username, "MESSAGE");
        }

        unread.forEach(a -> a.setRead(true));
        activityRepository.saveAll(unread);
        return ResponseEntity.ok().build();
    }
}