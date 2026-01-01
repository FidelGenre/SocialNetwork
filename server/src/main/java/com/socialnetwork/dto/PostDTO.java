package com.socialnetwork.dto; // Asegúrate de que el paquete coincida con la carpeta

import lombok.Data; // ESTA ES LA LÍNEA QUE FALTA
import java.time.LocalDateTime;

@Data // Esta anotación ahora funcionará correctamente
public class PostDTO {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private String username;
    private String displayName;
}