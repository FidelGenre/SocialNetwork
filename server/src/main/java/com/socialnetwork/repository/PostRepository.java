package com.socialnetwork.repository;

import com.socialnetwork.entity.Post;
import com.socialnetwork.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // 1. FEED PRINCIPAL
    List<Post> findAllByParentPostIsNullOrderByCreatedAtDesc();

    // 2. PERFIL - THREADS
    List<Post> findByUserUsernameAndParentPostIsNullOrderByCreatedAtDesc(String username);

    // 3. PERFIL - REPLIES
    List<Post> findByUserUsernameAndParentPostIsNotNullOrderByCreatedAtDesc(String username);

    // 4. PERFIL - REPOSTS
    List<Post> findByUserUsernameAndOriginalPostIdIsNotNullOrderByCreatedAtDesc(String username);

    // 5. FEED PERSONALIZADO
    List<Post> findByUserInAndParentPostIsNullOrderByCreatedAtDesc(List<User> users);

    // 6. HILOS
    List<Post> findByParentPostIdOrderByCreatedAtDesc(Long parentId);

    // 7. NUEVO: Buscar reposts específicos de un usuario (Para el Toggle)
    List<Post> findByUserAndOriginalPostId(User user, Long originalPostId);

    // --- MÉTODOS PARA INTEGRIDAD REFERENCIAL ---
    List<Post> findByParentPost(Post post);
    List<Post> findByOriginalPostId(Long originalPostId);
}