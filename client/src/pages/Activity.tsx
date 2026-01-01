import React, { useState, useEffect } from 'react';
import { Heart, UserPlus, MessageCircle, Repeat2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import styles from './Activity.module.css';

export const Activity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchAndRead = async () => {
      if (!user) return;
      try {
        // 1. Consultamos las notificaciones del usuario
        const response = await api.get(`/activities/${user.username}`);
        setActivities(response.data);

        // 2. DISPARADOR DE VISTO: Marcamos las notificaciones generales como leídas
        // Esto limpia el punto rojo del corazón en la Sidebar
        await api.patch(`/activities/read?username=${user.username}&type=GENERAL`);
      } catch (error) {
        console.error("Error al cargar o actualizar actividad:", error);
      }
    };

    fetchAndRead();
  }, [user]);

  // Lógica de filtrado por tipo de acción
  const filteredActivities = filter === 'ALL' 
    ? activities 
    : activities.filter(a => a.type === filter);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Actividad</h1>
      
      <div className={styles.filters}>
        <button 
          onClick={() => setFilter('ALL')} 
          className={filter === 'ALL' ? styles.activeFilter : styles.filterBtn}
        >
          Todo
        </button>
        <button 
          onClick={() => setFilter('FOLLOW')} 
          className={filter === 'FOLLOW' ? styles.activeFilter : styles.filterBtn}
        >
          Seguimientos
        </button>
        <button 
          onClick={() => setFilter('LIKE')} 
          className={filter === 'LIKE' ? styles.activeFilter : styles.filterBtn}
        >
          Likes
        </button>
        <button 
          onClick={() => setFilter('REPOST')} 
          className={filter === 'REPOST' ? styles.activeFilter : styles.filterBtn}
        >
          Reposts
        </button>
        <button 
          onClick={() => setFilter('REPLY')} 
          className={filter === 'REPLY' ? styles.activeFilter : styles.filterBtn}
        >
          Respuestas
        </button>
      </div>

      <div className={styles.list}>
        {filteredActivities.length > 0 ? (
          filteredActivities.map((act) => (
            <div 
              key={act.id} 
              /* Si la notificación no ha sido leída, aplicamos un estilo diferente */
              className={`${styles.item} ${!act.read ? styles.unreadItem : ''}`}
            >
              <div className={styles.avatar}>
                {act.actor.displayName?.charAt(0).toUpperCase()}
                <div className={styles.badge}>
                  {act.type === 'FOLLOW' && <UserPlus size={12} fill="#53c1ff" color="#53c1ff" />}
                  {act.type === 'LIKE' && <Heart size={12} fill="#ff3040" color="#ff3040" />}
                  {act.type === 'REPOST' && <Repeat2 size={12} color="#00ba7c" />}
                  {act.type === 'REPLY' && <MessageCircle size={12} fill="#0095f6" color="#0095f6" />}
                </div>
              </div>
              <div className={styles.content}>
                <p className={styles.text}>
                  <strong>{act.actor.username}</strong> 
                  {act.type === 'FOLLOW' && " empezó a seguirte."}
                  {act.type === 'LIKE' && " le dio like a tu hilo."}
                  {act.type === 'REPOST' && " reposteó tu hilo."}
                  {act.type === 'REPLY' && " respondió a tu hilo."}
                </p>
                {/* Preview del contenido si existe un post asociado */}
                {act.post && <span className={styles.preview}>{act.post.content}</span>}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.empty}>No tienes actividad todavía.</p>
        )}
      </div>
    </div>
  );
};

export default Activity;