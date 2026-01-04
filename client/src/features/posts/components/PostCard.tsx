import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Repeat2, Send, Trash2, Search, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CreatePostModal } from './CreatePostModal';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import styles from './PostCard.module.css';

// --- UTILIDAD DE FORMATEO DE TIEMPO CORREGIDA ---
const formatTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  let diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0 && diffInSeconds > -43200) {
    diffInSeconds = 0;
  }

  if (diffInSeconds < 60) return 'ahora';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
};

export interface PostCardProps {
  id: string; 
  content: string;
  imageUrl?: string;
  createdAt: string; 
  likesCount: number;
  repliesCount: number;
  repostsCount: number;
  repostFromUserName?: string;
  likedByUsers?: { username: string }[]; 
  user?: {
    displayName?: string;
    username: string;
    avatarUrl?: string;
  };
}

export const PostCard: React.FC<PostCardProps> = ({ 
  id, content, imageUrl, createdAt, likesCount: initialLikes, 
  repliesCount, repostsCount: initialReposts, repostFromUserName, likedByUsers, user 
}) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [reposts, setReposts] = useState(initialReposts);
  const [isReposted, setIsReposted] = useState(!!repostFromUserName);

  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const BASE_URL = 'https://socialnetworkserver-3kyu.onrender.com';

  useEffect(() => {
    if (likedByUsers && currentUser) {
      const alreadyLiked = likedByUsers.some(u => u.username === currentUser.username);
      setIsLiked(alreadyLiked);
    }
  }, [likedByUsers, currentUser]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 1) {
        try {
          const res = await api.get(`/users/search?q=${searchQuery}`);
          setSearchResults(res.data);
        } catch (e) {
          console.error("Error buscando usuarios:", e);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const getFullImageUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${BASE_URL}${path}`;
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user?.username) navigate(`/profile/${user.username}`);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Evita navegar al detalle si se toca un botón o el menú de compartir
    if (target.closest('button') || target.closest(`.${styles.shareMenu}`)) return;
    navigate(`/post/${id}`);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    try {
      const res = await api.patch(`/posts/${id}/like?username=${currentUser.username}`);
      setLikes(res.data.likesCount);
      setIsLiked(!isLiked);
    } catch (e) { console.error("Error en Like:", e); }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    try {
      const res = await api.post(`/posts/${id}/repost?username=${currentUser.username}`);
      if (res.data.action === "deleted") {
        setReposts(prev => Math.max(0, prev - 1));
        setIsReposted(false);
      } else {
        setReposts(prev => prev + 1);
        setIsReposted(true);
      }
    } catch (e) { console.error("Error en Repost:", e); }
  };

  const handleSharePost = async (targetUsername: string) => {
    if (!currentUser) return;
    try {
      await api.post(`/posts/${id}/share?from=${currentUser.username}&to=${targetUsername}`);
      alert(`¡Post compartido con @${targetUsername}!`);
      setShowShareMenu(false);
      setSearchQuery('');
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Eliminar este post definitivamente?")) return;
    try {
      await api.delete(`/posts/${id}?username=${currentUser?.username}`);
      window.location.reload();
    } catch (e) { console.error("Error al borrar:", e); }
  };

  return (
    <div className={styles.cardWrapper} onClick={handleCardClick}>
      
      {repostFromUserName && (
        <div className={styles.repostHeader}>
          <Repeat2 size={14} color="#71767b" />
          <span>{repostFromUserName} reposteó</span>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.avatar} onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
          {user?.avatarUrl ? (
            <img src={getFullImageUrl(user.avatarUrl)} alt={user.username} className={styles.avatarImg} />
          ) : (
            (user?.displayName || user?.username || 'U').charAt(0).toUpperCase()
          )}
        </div>
        
        <div className={styles.contentCol}>
          <div className={styles.header}>
            <div className={styles.userInfo} onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
              <span className={styles.displayName}>{user?.displayName || user?.username || 'Usuario'}</span>
              <span className={styles.username}>@{user?.username}</span>
            </div>

            <div className={styles.headerRight}>
              <span className={styles.timestamp}>{formatTime(createdAt)}</span>
              {currentUser?.username === user?.username && (
                <button onClick={handleDelete} className={styles.deleteBtn}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
          
          <p className={styles.text}>{content}</p>

          {imageUrl && (
            <div className={styles.imageContainer}>
              <img src={getFullImageUrl(imageUrl)} alt="Multimedia" className={styles.postImg} />
            </div>
          )}
          
          <div className={styles.actions}>
            <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); setIsReplyModalOpen(true); }}>
              <MessageCircle size={18} />
              <span>{repliesCount > 0 ? repliesCount : ''}</span>
            </button>

            <button 
              className={styles.actionBtn} 
              onClick={handleRepost}
              style={{ color: isReposted ? '#00ba7c' : 'inherit' }}
            >
              <Repeat2 size={18} color={isReposted ? '#00ba7c' : 'currentColor'} />
              <span>{reposts > 0 ? reposts : ''}</span>
            </button>
            
            <button 
              className={styles.actionBtn} 
              onClick={handleLike} 
              style={{ color: isLiked ? '#f91880' : 'inherit' }}
            >
              <Heart size={18} fill={isLiked ? '#f91880' : 'none'} color={isLiked ? '#f91880' : 'currentColor'} />
              <span>{likes > 0 ? likes : ''}</span>
            </button>

            <div className={styles.shareContainer}>
              <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu); }}>
                <Send size={18} />
              </button>
              
              {showShareMenu && (
                <div className={styles.shareMenu} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.searchBar}>
                    <Search size={14} color="#71767b" />
                    <input 
                      type="text" 
                      placeholder="Buscar persona..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className={styles.resultsList}>
                    {searchResults.length > 0 ? (
                      searchResults.map(u => (
                        <button key={u.username} onClick={() => handleSharePost(u.username)} className={styles.userItem}>
                          <UserPlus size={14} />
                          <span>@{u.username}</span>
                        </button>
                      ))
                    ) : (
                      <p className={styles.noResults}>
                        {searchQuery.length > 1 ? "No se encontraron usuarios" : "Escribe el nombre..."}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isReplyModalOpen && (
        <CreatePostModal 
          parentId={id} 
          onClose={() => setIsReplyModalOpen(false)} 
          onPost={() => window.location.reload()} 
        />
      )}
    </div>
  );
};