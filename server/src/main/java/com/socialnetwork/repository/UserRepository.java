package com.socialnetwork.repository;

import com.socialnetwork.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    // Método para el buscador: busca por nombre de usuario o nombre mostrado ignorando mayúsculas
    List<User> findByUsernameContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(
            String username, String displayName);
}