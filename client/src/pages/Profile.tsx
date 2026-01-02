import { useState, useEffect, useCallback } from 'react';
import { MoreHorizontal, LogOut, MessageSquare } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../features/posts/components/PostCard';
import { EditProfileModal } from '../features/profile/components/EditProfileModal';
import api from '../services/api';
import styles from './Profile.module.css';

export const Profile = () => {
  const { username: profileUsername } = useParams<{ username: string }>();
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('Threads');
  const [posts, setPosts] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewedUser, setViewedUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = currentUser?.username === profileUsername;

  // CORRECCIÓN: Se cambió localhost por la URL de producción de Render
  const getFullAvatarUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined; 
    if (url.startsWith('http') || url.startsWith('blob')) return url;
    return `https://socialnetworkserver-3kyu.onrender.com${url}`;
  };

  const fetchUserData = useCallback(async () => {
    if (!profileUsername) return;
    try {
      const userRes = await api.get(`/users/search?q=${profileUsername}`);
      const found = userRes.data.find((u: any) => u.username === profileUsername);

      if (found) {
        setViewedUser(found);
        const status = found.followers?.some((f: any) => f.username === currentUser?.username);
        setIsFollowing(!!status);
      }
    } catch (error) {
      console.error("Error cargando datos de usuario:", error);
    }
  }, [profileUsername, currentUser]);

  const fetchTabContent = useCallback(async () => {
    if (!profileUsername) return;
    try {
      let endpoint = '';
      switch (activeTab) {
        case 'Threads': endpoint = `/posts/user/${profileUsername}/threads`; break;
        case 'Replies': endpoint = `/posts/user/${profileUsername}/replies`; break;
        case 'Reposts': endpoint = `/posts/user/${profileUsername}/reposts`; break;
        case 'Media': endpoint = `/posts/user/${profileUsername}/threads`; break;
        default: endpoint = `/posts/user/${profileUsername}/threads`;
      }
      const response = await api.get(endpoint);
      if (activeTab === 'Media') {
        setPosts(response.data.filter((p: any) => p.imageUrl && p.imageUrl.trim() !== ''));
      } else {
        setPosts(response.data);
      }
    } catch (error) {
      console.error(`Error cargando ${activeTab}:`, error);
      setPosts([]);
    }
  }, [profileUsername, activeTab]);

  useEffect(() => { fetchUserData(); }, [fetchUserData]);
  
  // EFECTO DE SINCRONIZACIÓN GLOBAL
  useEffect(() => { 
    fetchTabContent(); 

    const handleGlobalUpdate = () => {
      // Actualiza el feed si se crea un post desde el Layout global
      fetchTabContent();
    };

    window.addEventListener('postCreatedGlobal', handleGlobalUpdate);
    
    return () => {
      window.removeEventListener('postCreatedGlobal', handleGlobalUpdate);
    };
  }, [fetchTabContent]);

  const handleFollow = async () => {
    if (!currentUser || isOwnProfile) return;
    try {
      const res = await api.post(`/users/${profileUsername}/follow?followerUsername=${currentUser.username}`);
      setIsFollowing(res.data.following);
      fetchUserData();
    } catch (error) {
      console.error("Error al seguir:", error);
    }
  };

  if (!profileUsername) return null;

  return (
    <div className={styles.container}>
      <header className={styles.headerNav}>
        {isOwnProfile && (
          <button className={styles.menuBtn} onClick={logout} title="Cerrar Sesión">
            <LogOut size={20} />
          </button>
        )}
        <button className={styles.menuBtn}><MoreHorizontal size={20} /></button>
      </header>

      <section className={styles.userMain}>
        <div>
          <h1 className={styles.displayName}>{viewedUser?.displayName || profileUsername}</h1>
          <span className={styles.username}>@{profileUsername}</span>
        </div>
        
        <div className={styles.avatar}>
          {viewedUser?.avatarUrl ? (
            <img 
              src={getFullAvatarUrl(viewedUser.avatarUrl)} 
              alt="Avatar" 
              className={styles.avatarImg} 
            />
          ) : (
            (viewedUser?.displayName || profileUsername).charAt(0).toUpperCase()
          )}
        </div>
      </section>

      <div className={styles.bioSection}>
        <p className={styles.bioText}>{viewedUser?.bio || "Sin biografía disponible."}</p>
      </div>

      <div className={styles.socialRow}>
        <span><strong>{viewedUser?.followers?.length || 0}</strong> seguidores</span>
        <span className={styles.dot}>·</span>
        <span><strong>{viewedUser?.following?.length || 0}</strong> seguidos</span>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        {isOwnProfile ? (
          <button className={styles.editButton} onClick={() => setIsEditModalOpen(true)} style={{ flex: 1 }}>
            Editar perfil
          </button>
        ) : (
          <>
            <button 
              className={styles.editButton} 
              onClick={handleFollow}
              style={{ 
                flex: 1, 
                backgroundColor: isFollowing ? 'transparent' : '#fff', 
                color: isFollowing ? '#fff' : '#000',
                border: isFollowing ? '1px solid #333' : 'none'
              }}
            >
              {isFollowing ? 'Siguiendo' : 'Seguir'}
            </button>
            <button 
              className={styles.editButton} 
              onClick={() => navigate(`/messages/${profileUsername}`)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <MessageSquare size={18} /> Mensaje
            </button>
          </>
        )}
      </div>

      <nav className={styles.tabs}>
        {['Threads', 'Replies', 'Media', 'Reposts'].map((tab) => (
          <button 
            key={tab} 
            className={`${styles.tabItem} ${activeTab === tab ? styles.tabActive : ''}`} 
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className={styles.feedList}>
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} {...post} />)
        ) : (
          <p style={{ color: '#4d4d4d', textAlign: 'center', marginTop: '40px' }}>
            No hay nada en {activeTab.toLowerCase()}
          </p>
        )}
      </div>

      {isEditModalOpen && (
        <EditProfileModal 
          user={viewedUser || currentUser} 
          onClose={() => setIsEditModalOpen(false)} 
          onUpdate={fetchUserData} 
        />
      )}
    </div>
  );
};

export default Profile;