package com.socialnetwork.repository;

import com.socialnetwork.entity.Message;
import com.socialnetwork.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query("SELECT m FROM Message m WHERE (m.sender = :user1 AND m.recipient = :user2) " +
           "OR (m.sender = :user2 AND m.recipient = :user1) ORDER BY m.createdAt ASC")
    List<Message> findConversation(@Param("user1") User user1, @Param("user2") User user2);

    // Encuentra a todos los que tienen mensajes contigo (enviados o recibidos)
    @Query("SELECT DISTINCT u FROM User u WHERE u.username != :username AND u IN (" +
           "SELECT m.sender FROM Message m WHERE m.recipient.username = :username " +
           "UNION " +
           "SELECT m.recipient FROM Message m WHERE m.sender.username = :username)")
    List<User> findChatPartners(@Param("username") String username);
}