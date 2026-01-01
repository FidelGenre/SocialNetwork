import React from 'react';
import { Sidebar } from './Sidebar';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className={styles.container}>
      {/* Barra lateral fija a la izquierda */}
      <aside className={styles.leftColumn}>
        <Sidebar />
      </aside>
      
      {/* Contenedor que centra el contenido */}
      <main className={styles.mainContentWrapper}>
        <div className={styles.feedContainer}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;