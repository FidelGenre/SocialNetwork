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
    private int likesCount = 0;
    private int repliesCount = 0;
    private int repostsCount = 0;
    
    // CAMPOS QUE FALTABAN PARA EL COMPILADOR
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

    // GETTERS Y SETTERS (Indispensables)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public int getLikesCount() { return likesCount; }
    public void setLikesCount(int likesCount) { this.likesCount = likesCount; }
    public int getRepliesCount() { return repliesCount; }
    public void setRepliesCount(int repliesCount) { this.repliesCount = repliesCount; }
    public int getRepostsCount() { return repostsCount; }
    public void setRepostsCount(int repostsCount) { this.repostsCount = repostsCount; }
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