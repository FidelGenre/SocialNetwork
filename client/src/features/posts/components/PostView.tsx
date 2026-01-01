import React, { useState, useEffect, useCallback } from 'react'; // <--- Faltaba esto
import { useParams, useNavigate } from 'react-router-dom'; // <--- Faltaba esto
import { ArrowLeft } from 'lucide-react';

// Según tu árbol: PostView está en /components/ y api está en /services/
// La ruta '../services/api' es correcta si están al mismo nivel dentro de src
import api from '../../../services/api'; 

import { PostCard } from './PostCard';
import styles from './PostView.module.css';

export const PostView = () => {
  // Definimos que el ID viene de los parámetros de la URL
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();

  // Estados con tipos para TypeScript
  const [mainPost, setMainPost] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPostData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // 1. Traer el post principal
      const postRes = await api.get(`/posts/${id}`);
      setMainPost(postRes.data);

      // 2. Traer las respuestas
      const repliesRes = await api.get(`/posts/${id}/replies`);
      setReplies(repliesRes.data);
    } catch (error) {
      console.error("Error cargando el detalle:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPostData();
  }, [fetchPostData]);

  if (loading) return <div className={styles.loading}>Cargando hilo...</div>;
  if (!mainPost) return <div className={styles.loading}>Post no encontrado.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          <ArrowLeft size={20} />
          <span>Post</span>
        </button>
      </header>

      <div className={styles.content}>
        {/* Post Principal */}
        <div className={styles.mainPost}>
          <PostCard {...mainPost} />
        </div>

        <div className={styles.divider}>Respuestas</div>

        {/* Lista de Comentarios */}
        <div className={styles.repliesList}>
          {replies.map((reply) => (
            <PostCard key={reply.id} {...reply} />
          ))}
        </div>
      </div>
    </div>
  );
};