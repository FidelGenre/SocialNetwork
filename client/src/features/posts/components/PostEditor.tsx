import React, { useState, useRef } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import styles from './PostEditor.module.css';

interface PostEditorProps {
  onPostCreated: () => void;
}

export const PostEditor: React.FC<PostEditorProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  
  // Cambiamos el string por un objeto File para el archivo real
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Referencia para hacer clic en el input de archivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Creamos una URL temporal para que el usuario vea la foto antes de publicarla
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
      // IMPORTANTE: Para enviar archivos usamos FormData
      const formData = new FormData();
      formData.append('content', content);
      formData.append('username', user.username);
      
      if (selectedFile) {
        formData.append('file', selectedFile); // "file" debe coincidir con el @RequestParam del backend
      }

      // Al enviar FormData, axios configura automáticamente el "multipart/form-data"
      await api.post('/posts', formData);

      // Limpiar todo tras el éxito
      setContent('');
      removeImage();
      onPostCreated();
    } catch (error) {
      console.error("Error al publicar:", error);
      alert("No se pudo publicar el post. Revisa la consola.");
    }
  };

  return (
    <div className={styles.editor}>
      <div className={styles.avatar}>
        {user?.displayName?.charAt(0).toUpperCase()}
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          placeholder="¿Qué hay de nuevo?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles.textarea}
        />
        
        {/* Previsualización de la imagen antes de subir */}
        {previewUrl && (
          <div className={styles.previewContainer}>
            <img src={previewUrl} alt="Preview" className={styles.previewImg} />
            <button type="button" onClick={removeImage} className={styles.removeBtn}>
              <X size={16} />
            </button>
          </div>
        )}

        <div className={styles.actions}>
          <div className={styles.leftActions}>
            {/* Input de archivo real (OCULTO) */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            {/* Botón que dispara el selector de archivos */}
            <button 
              type="button" 
              className={styles.iconBtn} 
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon size={20} color={selectedFile ? '#0084ff' : '#4d4d4d'} />
            </button>
          </div>

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
  );
};