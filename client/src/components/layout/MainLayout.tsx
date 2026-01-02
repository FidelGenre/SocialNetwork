import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { CreatePostModal } from '../../features/posts/components/CreatePostModal';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handlePostCreated = () => {
    setIsModalOpen(false);
    // Emitimos el evento global. 
    // Usamos dispatchEvent para que otros componentes suscritos se enteren.
    window.dispatchEvent(new CustomEvent('postCreatedGlobal'));
  };

  return (
    <div className={styles.container}>
      <aside className={styles.leftColumn}>
        <Sidebar />
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.centerColumn}>
          {children}
        </div>
      </main>

      {!isModalOpen && (
        <button 
          className={styles.floatingAddBtn} 
          onClick={() => setIsModalOpen(true)}
          aria-label="Crear nuevo post"
        >
          <Plus size={24} />
        </button>
      )}

      {isModalOpen && (
        <CreatePostModal 
          onClose={() => setIsModalOpen(false)} 
          onPost={handlePostCreated} 
        />
      )}
    </div>
  );
};

export default MainLayout;