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
/**
 * CONFIGURACIÓN DE CORS:
 * Autoriza tanto el entorno de desarrollo local como tu URL de producción en Render.
 */
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

    // Directorio para almacenamiento de imágenes
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

    // 3. ELIMINAR POST (MODIFICADO: Borrado profundo de todas las dependencias)
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deletePost(@PathVariable("id") Long id) {
        return postRepository.findById(id).map(post -> {
            // A. Limpiar notificaciones asociadas al post (Likes, Reposts, etc)
            activityRepository.deleteByPost(post);
            
            // B. Limpiar relación de likes (tabla intermedia)
            post.getLikedByUsers().clear();
            
            // C. Limpiar mensajes que compartieron este post (ponemos la referencia en null)
            List<Message> sharedInMessages = messageRepository.findBySharedPost(post);
            sharedInMessages.forEach(msg -> msg.setSharedPost(null));
            messageRepository.saveAll(sharedInMessages);

            // D. BORRAR REPOSTS: Buscamos posts cuyo originalPostId coincida con este ID
            List<Post> reposts = postRepository.findByOriginalPostId(id);
            postRepository.deleteAll(reposts);

            // E. BORRAR RESPUESTAS: Buscamos hilos que tengan a este post como padre
            List<Post> replies = postRepository.findByParentPost(post);
            postRepository.deleteAll(replies);

            // F. Si el post a borrar es una respuesta, decrementamos el contador del padre
            if (post.getParentPost() != null) {
                Post parent = post.getParentPost();
                parent.setRepliesCount(Math.max(0, parent.getRepliesCount() - 1));
                postRepository.save(parent);
            }

            // G. Borrado final del post principal
            postRepository.delete(post);
            
            return ResponseEntity.ok().body(Map.of("message", "Post y todas sus referencias (reposts/respuestas) eliminados"));
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

    // 5. REPOST
    @PostMapping("/{id}/repost")
    @Transactional
    public ResponseEntity<?> repostPost(@PathVariable("id") Long id, @RequestParam("username") String username) {
        Optional<Post> originalOpt = postRepository.findById(id);
        Optional<User> userWhoRepostsOpt = userRepository.findByUsername(username);

        if (originalOpt.isPresent() && userWhoRepostsOpt.isPresent()) {
            Post original = originalOpt.get();
            User me = userWhoRepostsOpt.get();

            Optional<Post> existingRepost = postRepository.findAll().stream()
                .filter(p -> p.getUser().getId().equals(me.getId()) && id.equals(p.getOriginalPostId()))
                .findFirst();

            if (existingRepost.isPresent()) {
                postRepository.delete(existingRepost.get());
                original.setRepostsCount(Math.max(0, original.getRepostsCount() - 1));
                postRepository.save(original);
                return ResponseEntity.ok(Map.of("message", "Repost eliminado"));
            } else {
                Post repost = new Post();
                repost.setContent(original.getContent());
                repost.setImageUrl(original.getImageUrl());
                repost.setUser(me); 
                repost.setCreatedAt(LocalDateTime.now());
                repost.setRepostFromUserName(me.getDisplayName()); 
                repost.setOriginalPostId(original.getId());

                original.setRepostsCount(original.getRepostsCount() + 1);
                postRepository.save(original);
                postRepository.save(repost);
                
                createActivity("REPOST", me, original.getUser(), original);
                return ResponseEntity.ok(Map.of("message", "Repost creado"));
            }
        }
        return ResponseEntity.notFound().build();
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