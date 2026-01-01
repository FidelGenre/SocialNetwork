package com.socialnetwork.repository;

import com.socialnetwork.entity.Activity;
import com.socialnetwork.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    
    // 1. Obtener todas las notificaciones de un usuario
    List<Activity> findByRecipientUsernameOrderByCreatedAtDesc(String username);

    // 2. Obtener notificaciones específicas no leídas (ej: solo mensajes)
    List<Activity> findByRecipientUsernameAndTypeAndIsReadFalse(String username, String type);

    // 3. Obtener todas las notificaciones no leídas excepto un tipo específico
    List<Activity> findByRecipientUsernameAndTypeNotAndIsReadFalse(String username, String type);

    // 4. Métodos para el sistema de chat (Conteo de mensajes no leídos por remitente)
    long countByRecipientUsernameAndActorUsernameAndTypeAndIsReadFalse(String recipient, String actor, String type);

    List<Activity> findByRecipientUsernameAndTypeAndActorUsernameAndIsReadFalse(String recipient, String type, String actor);

    // --- MÉTODO CLAVE PARA ELIMINAR POSTS ---
    // Elimina todas las notificaciones (likes, reposts, shares) asociadas a un post antes de borrarlo
    @Transactional
    void deleteByPost(Post post);
}