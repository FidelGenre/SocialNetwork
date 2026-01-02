package com.socialnetwork.controller;

import com.socialnetwork.entity.*;
import com.socialnetwork.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(
    origins = {"https://socialnetwork-m3m4.onrender.com", "http://localhost:5173"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowedHeaders = "*"
)
public class PostController {

    @Autowired private PostRepository postRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ActivityRepository activityRepository;
    @Autowired private MessageRepository messageRepository; 

    private final Path root = Paths.get("uploads");

    // 1. OBTENER UN POST POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable("id") Long id) {
        return postRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 2. CREAR POST (Texto e Imagen)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPost(
            @RequestParam("content") String content,
            @RequestParam("username") String username,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "parentId", required = false) Long parentId) {
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        User user = userOpt.get();
        Post post = new Post();
        post.setContent(content);
        post.setUser(user);
        post.setCreatedAt(LocalDateTime.now());
        post.setLikesCount(0);
        post.setRepliesCount(0);
        post.setRepostsCount(0);

        if (file != null && !file.isEmpty()) {
            try {
                if (!Files.exists(root)) Files.createDirectories(root);
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Files.copy(file.getInputStream(), this.root.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
                post.setImageUrl("/api/posts/images/" + fileName);
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al guardar la imagen");
            }
        }

        if (parentId != null) {
            postRepository.findById(parentId).ifPresent(parent -> {
                post.setParentPost(parent);
                parent.setRepliesCount(parent.getRepliesCount() + 1);
                postRepository.save(parent);
            });
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(postRepository.save(post));
    }

    // 3. ELIMINAR POST
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deletePost(@PathVariable("id") Long id) {
        return postRepository.findById(id).map(post -> {
            activityRepository.deleteByPost(post);
            post.getLikedByUsers().clear();
            
            List<Message> sharedInMessages = messageRepository.findBySharedPost(post);
            sharedInMessages.forEach(msg -> msg.setSharedPost(null));
            messageRepository.saveAll(sharedInMessages);

            List<Post> reposts = postRepository.findByOriginalPostId(id);
            postRepository.deleteAll(reposts);

            List<Post> replies = postRepository.findByParentPost(post);
            postRepository.deleteAll(replies);

            if (post.getParentPost() != null) {
                Post parent = post.getParentPost();
                parent.setRepliesCount(Math.max(0, parent.getRepliesCount() - 1));
                postRepository.save(parent);
            }

            postRepository.delete(post);
            return ResponseEntity.ok().body(Map.of("message", "Post eliminado correctamente"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 4. DAR/QUITAR ME GUSTA
    @PatchMapping("/{id}/like")
    @Transactional
    public ResponseEntity<?> likePost(@PathVariable("id") Long id, @RequestParam("username") String username) {
        Optional<Post> postOpt = postRepository.findById(id);
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (postOpt.isPresent() && userOpt.isPresent()) {
            Post post = postOpt.get();
            User user = userOpt.get();

            if (post.getLikedByUsers().contains(user)) {
                post.getLikedByUsers().remove(user);
                post.setLikesCount(Math.max(0, post.getLikesCount() - 1));
            } else {
                post.getLikedByUsers().add(user);
                post.setLikesCount(post.getLikesCount() + 1);
                createActivity("LIKE", user, post.getUser(), post);
            }
            return ResponseEntity.ok(postRepository.save(post));
        }
        return ResponseEntity.notFound().build();
    }

    // 5. REPOST (Lógica de Toggle y Limpieza de Duplicados)
    @PostMapping("/{id}/repost")
    @Transactional
    public ResponseEntity<?> repostPost(@PathVariable("id") Long id, @RequestParam("username") String username) {
        Post postClicked = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post no encontrado"));
        User me = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Identificamos el post fuente real
        Long targetOriginalId = (postClicked.getOriginalPostId() != null) 
                                ? postClicked.getOriginalPostId() 
                                : postClicked.getId();

        Post originalPost = postRepository.findById(targetOriginalId)
                .orElseThrow(() -> new RuntimeException("Post original no encontrado"));

        // Buscamos todos los reposts del usuario para este post específico
        List<Post> existingReposts = postRepository.findByUserAndOriginalPostId(me, targetOriginalId);

        if (!existingReposts.isEmpty()) {
            // SI EXISTE -> TOGGLE OFF (Limpieza masiva de duplicados)
            postRepository.deleteAll(existingReposts);
            
            // Actualizamos contador del post original restando 1
            int currentCount = originalPost.getRepostsCount() != null ? originalPost.getRepostsCount() : 0;
            originalPost.setRepostsCount(Math.max(0, currentCount - 1));
            postRepository.save(originalPost);
            
            return ResponseEntity.ok(Map.of("action", "deleted", "message", "Repost eliminado"));
        } else {
            // SI NO EXISTE -> TOGGLE ON
            Post repost = new Post();
            repost.setContent(originalPost.getContent());
            repost.setImageUrl(originalPost.getImageUrl());
            repost.setUser(me); 
            repost.setCreatedAt(LocalDateTime.now());
            repost.setRepostFromUserName(me.getDisplayName() != null ? me.getDisplayName() : me.getUsername()); 
            repost.setOriginalPostId(originalPost.getId());

            // Incrementamos contador del original
            int currentCount = originalPost.getRepostsCount() != null ? originalPost.getRepostsCount() : 0;
            originalPost.setRepostsCount(currentCount + 1);
            
            postRepository.save(originalPost);
            postRepository.save(repost);
            
            createActivity("REPOST", me, originalPost.getUser(), originalPost);
            return ResponseEntity.ok(Map.of("action", "created", "message", "Repost creado"));
        }
    }

    // 6. COMPARTIR EN CHAT
    @PostMapping("/{id}/share")
    @Transactional
    public ResponseEntity<?> sharePost(
            @PathVariable("id") Long id, 
            @RequestParam("from") String fromUsername, 
            @RequestParam("to") String toUsername) {
        
        Optional<Post> postOpt = postRepository.findById(id);
        Optional<User> senderOpt = userRepository.findByUsername(fromUsername);
        Optional<User> receiverOpt = userRepository.findByUsername(toUsername);

        if (postOpt.isPresent() && senderOpt.isPresent() && receiverOpt.isPresent()) {
            Post post = postOpt.get();
            User sender = senderOpt.get();
            User receiver = receiverOpt.get();

            Message message = new Message();
            message.setSender(sender);
            message.setRecipient(receiver);
            message.setSharedPost(post); 
            message.setContent("He compartido un post contigo");
            message.setCreatedAt(LocalDateTime.now());
            
            messageRepository.save(message);
            createActivity("SHARE_MSG", sender, receiver, post);
            
            return ResponseEntity.ok(Map.of("message", "Post compartido en el chat"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error al compartir");
    }

    // 7. FEED Y PERFIL
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postRepository.findAllByParentPostIsNullOrderByCreatedAtDesc());
    }

    @GetMapping("/user/{username}/threads")
    public ResponseEntity<List<Post>> getUserThreads(@PathVariable("username") String username) {
        return ResponseEntity.ok(postRepository.findByUserUsernameAndParentPostIsNullOrderByCreatedAtDesc(username));
    }

    @GetMapping("/user/{username}/replies")
    public ResponseEntity<List<Post>> getUserReplies(@PathVariable("username") String username) {
        return ResponseEntity.ok(postRepository.findByUserUsernameAndParentPostIsNotNullOrderByCreatedAtDesc(username));
    }

    @GetMapping("/user/{username}/reposts")
    public ResponseEntity<List<Post>> getUserReposts(@PathVariable("username") String username) {
        return ResponseEntity.ok(postRepository.findByUserUsernameAndOriginalPostIdIsNotNullOrderByCreatedAtDesc(username));
    }

    @GetMapping("/{id}/replies")
    public ResponseEntity<List<Post>> getReplies(@PathVariable("id") Long id) {
        return ResponseEntity.ok(postRepository.findByParentPostIdOrderByCreatedAtDesc(id));
    }

    // 8. SERVIR IMÁGENES
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable("filename") String filename) {
        try {
            Path file = root.resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, Files.probeContentType(file))
                        .body(resource);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private void createActivity(String type, User actor, User recipient, Post post) {
        if (actor.getUsername().equals(recipient.getUsername()) && !type.equals("SHARE_MSG")) return;
        Activity act = new Activity();
        act.setType(type);
        act.setActor(actor);
        act.setRecipient(recipient);
        act.setPost(post);
        act.setCreatedAt(LocalDateTime.now());
        act.setRead(false);
        activityRepository.save(act);
    }
}