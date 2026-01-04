import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PostEditor } from '../features/posts/components/PostEditor';
import { PostCard } from '../features/posts/components/PostCard';
import api from '../services/api';
import styles from './Home.module.css';

// Interfaz para tipado de posts
interface Post {
  id: string;
  content: string;
  [key: string]: any; 
}

export const Home: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedType, setFeedType] = useState<'Para ti' | 'Siguiendo'>('Para ti');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Sincronización con el backend en Render
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

    // Listener para actualizaciones globales (creación de posts)
    const handleGlobalUpdate = () => fetchPosts();
    window.addEventListener('postCreatedGlobal', handleGlobalUpdate);
    
    return () => {
      window.removeEventListener('postCreatedGlobal', handleGlobalUpdate);
    };
  }, [fetchPosts]);

  return (
    <div className={styles.container}>
      {/* mainWrapper es la caja central que contiene el feed */}
      <div className={styles.mainWrapper}>
        <header className={styles.header}>
          <div className={styles.selectorWrapper}>
            <button className={styles.feedSelector} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <span>{feedType}</span>
              <ChevronDown size={16} className={isDropdownOpen ? styles.rotate : ''} />
            </button>
            
            {isDropdownOpen && (
              <div className={styles.dropdown}>
                <button onClick={() => { setFeedType('Para ti'); setIsDropdownOpen(false); }}>
                  Para ti
                </button>
                <button onClick={() => { setFeedType('Siguiendo'); setIsDropdownOpen(false); }}>
                  Siguiendo
                </button>
              </div>
            )}
          </div>
        </header>

        <div className={styles.editorSection}>
          <PostEditor onPostCreated={fetchPosts} />
        </div>

        <div className={styles.feedList}>
          {posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;