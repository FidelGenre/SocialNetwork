package com.socialnetwork.repository;

import com.socialnetwork.entity.Post;
import com.socialnetwork.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // 1. FEED PRINCIPAL: Todos los posts que no son respuestas
    List<Post> findAllByParentPostIsNullOrderByCreatedAtDesc();

    // 2. PERFIL - PESTAÑA "THREADS": Posts propios que no son respuestas
    List<Post> findByUserUsernameAndParentPostIsNullOrderByCreatedAtDesc(String username);

    // 3. PERFIL - PESTAÑA "REPLIES": Posts propios que SÍ son respuestas a otros
    List<Post> findByUserUsernameAndParentPostIsNotNullOrderByCreatedAtDesc(String username);

    // 4. PERFIL - PESTAÑA "REPOSTS": Posts que tienen un ID de post original (compartidos)
    List<Post> findByUserUsernameAndOriginalPostIdIsNotNullOrderByCreatedAtDesc(String username);

    // 5. SEGUIDORES: Feed personalizado (opcional)
    List<Post> findByUserInAndParentPostIsNullOrderByCreatedAtDesc(List<User> users);

    // 6. DETALLE DE POST: Obtener todas las respuestas de un post específico
    List<Post> findByParentPostIdOrderByCreatedAtDesc(Long parentId);
}