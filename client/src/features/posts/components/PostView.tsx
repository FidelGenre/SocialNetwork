import { useState, useEffect, useCallback } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../../services/api'; 
import { PostCard } from './PostCard';
import styles from './PostView.module.css';

export const PostView = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();

  const [mainPost, setMainPost] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPostData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const postRes = await api.get(`/posts/${id}`);
      setMainPost(postRes.data);

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
        <div className={styles.mainPost}>
          {/* PASAMOS LA PROP hideViewReplies EN TRUE PARA EL POST PRINCIPAL */}
          <PostCard {...mainPost} hideViewReplies={true} />
        </div>

        <div className={styles.divider}>Respuestas</div>

        <div className={styles.repliesList}>
          {replies.length > 0 ? (
            replies.map((reply) => (
              <PostCard key={reply.id} {...reply} />
            ))
          ) : (
            <div className={styles.noReplies}>Aún no hay respuestas.</div>
          )}
        </div>
      </div>
    </div>
  );
};