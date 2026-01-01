import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import styles from './CreatePostModal.module.css';

interface CreatePostModalProps {
  parentId?: number;
  onClose: () => void;
  onPost: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ parentId, onClose, onPost }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  
  // Estados para el archivo y su vista previa
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Referencia para el input de tipo file oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !selectedFile) || !user) return;

    try {
      const formData = new FormData();
      formData.append('content', content);
      // Enviamos el username solo en el FormData para evitar el error 404 por duplicidad
      formData.append('username', user.username);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      // La URL se mantiene limpia. El backend recibirá el username desde el FormData
      const url = parentId ? `/posts?parentId=${parentId}` : '/posts';
      
      await api.post(url, formData);
      
      onPost();
      onClose();
    } catch (error) {
      console.error("Error al publicar:", error);
      alert("No se pudo publicar el hilo.");
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
          <span className={styles.headerTitle}>{parentId ? 'Responder' : 'Nuevo hilo'}</span>
          <div style={{ width: 28 }}></div>
        </div>

        <form onSubmit={handleSubmit} className={styles.formBody}>
          <div className={styles.mainContainer}>
            {/* Columna Izquierda */}
            <div className={styles.leftColumn}>
              <div className={styles.avatar}>
                {user?.displayName?.charAt(0).toUpperCase()}
              </div>
              <div className={styles.connectorLine}></div>
            </div>

            {/* Columna Derecha */}
            <div className={styles.rightColumn}>
              <div className={styles.userInfo}>
                <span className={styles.username}>{user?.username}</span>
              </div>
              
              <textarea
                placeholder="¿Qué hay de nuevo?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={styles.textarea}
                autoFocus
              />

              {/* Vista previa pequeña de la imagen */}
              {previewUrl && (
                <div className={styles.imagePreviewContainer}>
                  <img src={previewUrl} alt="Preview" className={styles.previewImg} />
                  <button type="button" className={styles.removeImgBtn} onClick={removeImage}>
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className={styles.actionIcons}>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                />
                
                <button 
                  type="button" 
                  className={styles.iconBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon size={18} color={selectedFile ? '#0084ff' : '#777'} />
                </button>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button 
              type="submit" 
              className={styles.postBtn}
              disabled={!content.trim() && !selectedFile}
            >
              Publicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};