package com.socialnetwork.repository;

import com.socialnetwork.entity.Message;
import com.socialnetwork.entity.Post;
import com.socialnetwork.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // Encuentra la conversación entre dos usuarios específicos
    @Query("SELECT m FROM Message m WHERE (m.sender = :user1 AND m.recipient = :user2) " +
           "OR (m.sender = :user2 AND m.recipient = :user1) ORDER BY m.createdAt ASC")
    List<Message> findConversation(@Param("user1") User user1, @Param("user2") User user2);

    // Encuentra a todos los contactos (socios de chat) de un usuario
    @Query("SELECT DISTINCT u FROM User u WHERE u.username != :username AND u IN (" +
           "SELECT m.sender FROM Message m WHERE m.recipient.username = :username " +
           "UNION " +
           "SELECT m.recipient FROM Message m WHERE m.sender.username = :username)")
    List<User> findChatPartners(@Param("username") String username);

    // --- MÉTODO NUEVO PARA INTEGRIDAD REFERENCIAL ---
    // Permite encontrar mensajes que contienen un post compartido para limpiar la referencia antes de borrar el post
    List<Message> findBySharedPost(Post post);
}