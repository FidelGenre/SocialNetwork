package com.socialnetwork.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    // Permite leerla para el Login, pero no enviarla en los JSON de salida
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String displayName;
    private String bio;
    private String avatarUrl;
    private boolean enabled = true;

    @OneToMany(mappedBy = "user")
    @JsonIgnore // Corta el bucle de "Usuario -> Posts -> Usuario"
    private List<Post> posts = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_followers",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "follower_id")
    )
    @JsonIgnoreProperties({"following", "followers", "password", "posts", "roles"})
    private List<User> following = new ArrayList<>();

    @ManyToMany(mappedBy = "following")
    @JsonIgnoreProperties({"following", "followers", "password", "posts", "roles"})
    private List<User> followers = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role_name")
    private Set<String> roles = new HashSet<>();

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public List<User> getFollowing() { return following; }
    public void setFollowing(List<User> following) { this.following = following; }
    public List<User> getFollowers() { return followers; }
    public void setFollowers(List<User> followers) { this.followers = followers; }
    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
    public List<Post> getPosts() { return posts; }
    public void setPosts(List<Post> posts) { this.posts = posts; }
}