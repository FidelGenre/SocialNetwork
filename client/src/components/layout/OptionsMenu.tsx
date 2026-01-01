import React from 'react';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './OptionsMenu.module.css';

export const OptionsMenu = () => {
  const { logout } = useAuth();

  // Función para cambiar el tema de toda la web
  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  return (
    <div className={styles.menu}>
      <button className={styles.menuItem} onClick={toggleTheme}>
        <div className={styles.itemContent}>
          <span>Apariencia</span>
          <Sun size={18} className={styles.sunIcon} />
        </div>
      </button>

      <div className={styles.divider} />

      <button className={`${styles.menuItem} ${styles.logout}`} onClick={logout}>
        <span>Cerrar sesión</span>
        <LogOut size={18} />
      </button>
    </div>
  );
};