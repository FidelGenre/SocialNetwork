package com.socialnetwork.repository;

import com.socialnetwork.entity.Post;
import com.socialnetwork.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // 1. FEED PRINCIPAL: Obtiene todos los posts raíz (que no son respuestas)
    List<Post> findAllByParentPostIsNullOrderByCreatedAtDesc();

    // 2. PERFIL - THREADS: Posts propios que son el inicio de un hilo
    List<Post> findByUserUsernameAndParentPostIsNullOrderByCreatedAtDesc(String username);

    // 3. PERFIL - REPLIES: Posts propios que son respuestas a otros posts
    List<Post> findByUserUsernameAndParentPostIsNotNullOrderByCreatedAtDesc(String username);

    // 4. PERFIL - REPOSTS: Listado de posts que el usuario ha compartido (retweets)
    List<Post> findByUserUsernameAndOriginalPostIdIsNotNullOrderByCreatedAtDesc(String username);

    // 5. FEED PERSONALIZADO: Posts de una lista de usuarios seguidos
    List<Post> findByUserInAndParentPostIsNullOrderByCreatedAtDesc(List<User> users);

    // 6. HILOS: Obtener todas las respuestas directas de un post por su ID
    List<Post> findByParentPostIdOrderByCreatedAtDesc(Long parentId);

    // --- MÉTODOS PARA INTEGRIDAD REFERENCIAL (BORRADO) ---

    // A. Encuentra todas las respuestas asociadas a un objeto Post específico
    List<Post> findByParentPost(Post post);

    // B. NUEVO: Encuentra todos los reposts que apuntan a un ID de post original
    // Esencial para borrar los reposts cuando se elimina el post fuente
    List<Post> findByOriginalPostId(Long originalPostId);
}