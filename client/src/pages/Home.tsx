import { useState, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react'; // Importamos Plus
import { useAuth } from '../context/AuthContext';
import { PostEditor } from '../features/posts/components/PostEditor';
import { PostCard } from '../features/posts/components/PostCard';
import { CreatePostModal } from '../features/posts/components/CreatePostModal';
import api from '../services/api';
import styles from './Home.module.css';

export const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [feedType, setFeedType] = useState<'Para ti' | 'Siguiendo'>('Para ti');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const fetchPosts = useCallback(async () => {
    try {
      const url = feedType === 'Siguiendo' && user 
        ? `/posts?currentUser=${user.username}` 
        : '/posts';
      const response = await api.get(url);
      setPosts(response.data);
    } catch (error) {
      console.error("Error cargando el feed:", error);
    }
  }, [feedType, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.selectorWrapper}>
          <button className={styles.feedSelector} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <span>{feedType}</span>
            <ChevronDown size={16} className={isDropdownOpen ? styles.rotate : ''} />
          </button>
          {isDropdownOpen && (
            <div className={styles.dropdown}>
              <button onClick={() => { setFeedType('Para ti'); setIsDropdownOpen(false); }}>Para ti</button>
              <button onClick={() => { setFeedType('Siguiendo'); setIsDropdownOpen(false); }}>Siguiendo</button>
            </div>
          )}
        </div>
      </header>

      <div className={styles.editorSection}>
        <PostEditor onPostCreated={fetchPosts} />
      </div>

      <div className={styles.feedList}>
        {posts.map((post) => <PostCard key={post.id} {...post} />)}
      </div>

      {/* BOTÓN RECTANGULAR CON ICONO + */}
      <button 
        className={styles.floatingAddBtn} 
        onClick={() => setIsModalOpen(true)}
      >
        <Plus size={24} />
      </button>

      {isModalOpen && (
        <CreatePostModal 
          onClose={() => setIsModalOpen(false)} 
          onPost={fetchPosts} 
        />
      )}
    </div>
  );
};

export default Home;