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
@RequestMapping({"/posts", "/api/posts"})
@CrossOrigin(
    origins = {"https://socialnetworkclient-oyjw.onrender.com", "http://localhost:3000"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowedHeaders = "*"
)
public class PostController {

    @Autowired private PostRepository postRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ActivityRepository activityRepository;
    @Autowired private MessageRepository messageRepository; 

    private final Path root = Paths.get("uploads");

    // --- MÉTODOS AUXILIARES DE SINCRONIZACIÓN ---

    /**
     * Busca todas las copias (reposts) y les copia EXACTAMENTE
     * lo mismo que tiene el original: Números y LISTAS DE USUARIOS.
     */
    private void syncAllCopies(Post original) {
        List<Post> copies = postRepository.findByOriginalPostId(original.getId());
        for (Post copy : copies) {
            // 1. Copiar contadores
            copy.setLikesCount(original.getLikesCount());
            copy.setRepostsCount(original.getRepostsCount());

            // 2. 👇 COPIAR LAS LISTAS DE USUARIOS (¡ESTO ES LO QUE FALTABA!)
            // Al copiar el Set de usuarios, la copia sabrá que TÚ estás en la lista,
            // y el frontend pintará el corazón ROJO.
            copy.setLikedByUsers(new HashSet<>(original.getLikedByUsers()));
            copy.setRepostedByUsers(new HashSet<>(original.getRepostedByUsers()));
        }
        postRepository.saveAll(copies);
    }

    // 1. OBTENER UN POST POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable("id") Long id) {
        return postRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 2. CREAR POST
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
    public ResponseEntity<?> deletePost(
            @PathVariable("id") Long id,
            @RequestParam(value = "username", required = false) String usernameParam,
            @RequestBody(required = false) Map<String, String> body) {
        
        Optional<Post> postOpt = postRepository.findById(id);
        if (postOpt.isEmpty()) return ResponseEntity.notFound().build();
        Post post = postOpt.get();

        activityRepository.deleteByPost(post);
        post.getLikedByUsers().clear();
        post.getRepostedByUsers().clear();
        
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
        return ResponseEntity.ok().body(Map.of("message", "Post eliminado"));
    }

    // 4. LIKE / UNLIKE
    @PatchMapping("/{id}/like")
    @Transactional
    public ResponseEntity<?> likePost(@PathVariable("id") Long id, @RequestParam("username") String username) {
        Optional<Post> targetPostOpt = postRepository.findById(id);
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (targetPostOpt.isPresent() && userOpt.isPresent()) {
            Post targetPost = targetPostOpt.get();
            User user = userOpt.get();

            Long realOriginalId = (targetPost.getOriginalPostId() != null) 
                                  ? targetPost.getOriginalPostId() 
                                  : targetPost.getId();
            
            Post original = postRepository.findById(realOriginalId).orElse(targetPost);

            if (original.getLikedByUsers().contains(user)) {
                original.getLikedByUsers().remove(user);
                original.setLikesCount(Math.max(0, original.getLikesCount() - 1));
            } else {
                original.getLikedByUsers().add(user);
                original.setLikesCount(original.getLikesCount() + 1);
                createActivity("LIKE", user, original.getUser(), original);
            }
            
            postRepository.save(original);

            // Sincronizamos (Esto copiará la lista actualizada a las copias)
            syncAllCopies(original);

            return ResponseEntity.ok(original);
        }
        return ResponseEntity.notFound().build();
    }

    // 5. REPOST (MEJORADO: Nace con la lista de likes correcta)
    @PostMapping("/{id}/repost")
    @Transactional
    public ResponseEntity<?> repostPost(@PathVariable("id") Long id, @RequestParam("username") String username) {
        Optional<Post> targetPostOpt = postRepository.findById(id);
        Optional<User> userWhoRepostsOpt = userRepository.findByUsername(username);

        if (targetPostOpt.isPresent() && userWhoRepostsOpt.isPresent()) {
            Post targetPost = targetPostOpt.get();
            User me = userWhoRepostsOpt.get();

            Long realOriginalId = (targetPost.getOriginalPostId() != null) 
                                  ? targetPost.getOriginalPostId() 
                                  : targetPost.getId();

            Post originalRoot = postRepository.findById(realOriginalId)
                                .orElse(targetPost.getOriginalPostId() != null ? targetPost : targetPost);

            boolean isAlreadyReposted = originalRoot.getRepostedByUsers().contains(me);

            if (isAlreadyReposted) {
                // Toggle OFF
                originalRoot.getRepostedByUsers().remove(me);
                originalRoot.setRepostsCount(Math.max(0, originalRoot.getRepostsCount() - 1));
                postRepository.save(originalRoot);

                Optional<Post> repostCopy = postRepository.findAll().stream()
                    .filter(p -> p.getUser().getId().equals(me.getId()) && 
                                 realOriginalId.equals(p.getOriginalPostId()))
                    .findFirst();
                repostCopy.ifPresent(postRepository::delete);

                syncAllCopies(originalRoot);
                return ResponseEntity.ok(Map.of("message", "Repost eliminado"));

            } else {
                // Toggle ON
                originalRoot.getRepostedByUsers().add(me);
                originalRoot.setRepostsCount(originalRoot.getRepostsCount() + 1);
                postRepository.save(originalRoot);

                Post repost = new Post();
                repost.setContent(originalRoot.getContent());
                repost.setImageUrl(originalRoot.getImageUrl());
                repost.setUser(me); 
                repost.setCreatedAt(LocalDateTime.now());
                repost.setRepostFromUserName(me.getDisplayName()); 
                repost.setOriginalPostId(originalRoot.getId());
                
                // 👇 ESTO FALTABA:
                // Copiamos los números...
                repost.setLikesCount(originalRoot.getLikesCount());
                repost.setRepostsCount(originalRoot.getRepostsCount());
                // ... Y copiamos las LISTAS de usuarios
                repost.setLikedByUsers(new HashSet<>(originalRoot.getLikedByUsers()));
                repost.setRepostedByUsers(new HashSet<>(originalRoot.getRepostedByUsers()));
                
                postRepository.save(repost);
                
                syncAllCopies(originalRoot);
                
                createActivity("REPOST", me, originalRoot.getUser(), originalRoot);
                return ResponseEntity.ok(Map.of("message", "Repost creado"));
            }
        }
        return ResponseEntity.notFound().build();
    }

    // 6. SHARE
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

    // 7. GETTERS
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

    @GetMapping("/following/{username}")
    public ResponseEntity<List<Post>> getFollowingPosts(@PathVariable("username") String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        User currentUser = userOpt.get();
        List<User> following = currentUser.getFollowing(); 

        if (following == null || following.isEmpty()) return ResponseEntity.ok(Collections.emptyList());

        List<Post> posts = postRepository.findByUserInAndParentPostIsNullOrderByCreatedAtDesc(following);
        return ResponseEntity.ok(posts);
    }

    // 8. SERVIR IMAGENES
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