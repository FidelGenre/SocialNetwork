package com.socialnetwork.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private String imageUrl; 

    // Cambiados a Integer para permitir la validación != null en el controlador
    private Integer likesCount = 0;
    private Integer repliesCount = 0;
    private Integer repostsCount = 0;
    
    // Campos para la lógica de Repost
    private String repostFromUserName; 
    private Long originalPostId; 

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"posts", "followers", "following", "password", "roles", "bio", "enabled"})
    private User user;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    @JsonIgnoreProperties({"parentPost", "user"})
    private Post parentPost; 

    @ManyToMany
    @JoinTable(
        name = "post_likes",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnoreProperties({"posts", "followers", "following", "password"})
    private Set<User> likedByUsers = new HashSet<>();

    // --- GETTERS Y SETTERS ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    // Getters corregidos para retornar Integer
    public Integer getLikesCount() { return (likesCount == null) ? 0 : likesCount; }
    public void setLikesCount(Integer likesCount) { this.likesCount = likesCount; }

    public Integer getRepliesCount() { return (repliesCount == null) ? 0 : repliesCount; }
    public void setRepliesCount(Integer repliesCount) { this.repliesCount = repliesCount; }

    public Integer getRepostsCount() { return (repostsCount == null) ? 0 : repostsCount; }
    public void setRepostsCount(Integer repostsCount) { this.repostsCount = repostsCount; }

    public String getRepostFromUserName() { return repostFromUserName; }
    public void setRepostFromUserName(String name) { this.repostFromUserName = name; }

    public Long getOriginalPostId() { return originalPostId; }
    public void setOriginalPostId(Long id) { this.originalPostId = id; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime dt) { this.createdAt = dt; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Post getParentPost() { return parentPost; }
    public void setParentPost(Post parent) { this.parentPost = parent; }

    public Set<User> getLikedByUsers() { return likedByUsers; }
    public void setLikedByUsers(Set<User> users) { this.likedByUsers = users; }
}