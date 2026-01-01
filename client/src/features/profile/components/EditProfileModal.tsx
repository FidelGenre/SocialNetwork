import React, { useState, useRef } from 'react';
import api from '../../../services/api';
import styles from './EditProfileModal.module.css';

interface EditProfileModalProps {
  user: any;
  onClose: () => void;
  onUpdate: () => void;
}

export const EditProfileModal = ({ user, onClose, onUpdate }: EditProfileModalProps) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || '');
  
  // Gestión de imagen
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(user.avatarUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Crea una URL temporal para previsualización inmediata
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Actualizar texto (DisplayName y Bio)
      await api.put(`/users/${user.username}`, { displayName, bio });
      
      // 2. Actualizar Avatar (solo si hay un archivo nuevo seleccionado)
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        await api.patch(`/users/${user.username}/avatar`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      onUpdate(); // Refresca los datos en el perfil
      onClose();  // Cierra el modal
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert("No se pudo actualizar el perfil. Revisa la consola.");
    }
  };

  const getFullImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('blob:')) return path; // Imagen local temporal
    return `http://localhost:8080${path}`;      // Imagen del servidor
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Editar perfil</h2>
          <button onClick={onClose} className={styles.closeBtn}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* SECCIÓN DE AVATAR CIRCULAR */}
          <div className={styles.avatarContainer}>
            <div 
              className={styles.avatarWrapper} 
              onClick={() => fileInputRef.current?.click()}
              title="Click para cambiar foto"
            >
              {preview ? (
                <img src={getFullImageUrl(preview)} alt="Avatar" className={styles.previewImg} />
              ) : (
                <div className={styles.placeholderAvatar}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className={styles.cameraIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>

          <div className={styles.field}>
            <label>Nombre a mostrar</label>
            <input 
              type="text"
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              required
            />
          </div>

          <div className={styles.field}>
            <label>Biografía</label>
            <textarea 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              placeholder="Escribe algo sobre ti..."
              rows={3}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn}>
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};