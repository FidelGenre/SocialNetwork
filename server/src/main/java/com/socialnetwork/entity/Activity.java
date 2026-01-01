package com.socialnetwork.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // LIKE, REPLY, REPOST, MESSAGE

    @ManyToOne
    private User actor;

    @ManyToOne
    private User recipient;

    @ManyToOne
    private Post post;

    private LocalDateTime createdAt;
    
    // This MUST match the Repository name (IsReadFalse -> isRead)
    private boolean isRead = false;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public User getActor() { return actor; }
    public void setActor(User actor) { this.actor = actor; }
    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }
    public Post getPost() { return post; }
    public void setPost(Post post) { this.post = post; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
}