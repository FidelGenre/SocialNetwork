import { useState, useEffect } from 'react';
import { Home, Search, Heart, User, Menu, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { OptionsMenu } from './OptionsMenu';
import api from '../../services/api';
import styles from './Sidebar.module.css';

// IMPORTA TUS LOGOS
import logoWhite from '../../assets/box.png'; 
import logoBlack from '../../assets/766753.png'; 

// Definimos una interfaz básica para la actividad para evitar el error de any implícito
interface Activity {
  type: string;
  read: boolean;
  [key: string]: any;
}

export const Sidebar = () => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); 
  
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [hasUnreadActivity, setHasUnreadActivity] = useState(false);
  
  const location = useLocation();

  useEffect(() => {
    const checkTheme = () => {
      const htmlTheme = document.documentElement.getAttribute('data-theme');
      const bodyTheme = document.body.getAttribute('data-theme');
      setIsDarkMode(htmlTheme !== 'light' && bodyTheme !== 'light');
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!user) return;
    const checkNotifications = async () => {
      try {
        const res = await api.get(`/activities/${user.username}`);
        const activities: Activity[] = res.data;
        
        // CORRECCIÓN TS7006: Tipamos explícitamente el parámetro 'a'
        setHasUnreadMessages(activities.some((a: Activity) => a.type === 'MESSAGE' && !a.read));
        setHasUnreadActivity(activities.some((a: Activity) => a.type !== 'MESSAGE' && !a.read));
      } catch (e) {
        console.error("Error al verificar notificaciones");
      }
    };
    checkNotifications();
    const interval = setInterval(checkNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const navItems = [
    { icon: Home, path: '/' },
    { icon: Search, path: '/search' },
    { icon: MessageSquare, path: '/messages', badge: hasUnreadMessages },
    { icon: Heart, path: '/activity', badge: hasUnreadActivity },
    { icon: User, path: user ? `/profile/${user.username}` : '/profile' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.topSection}>
        <div className={styles.logo}>
          <img 
            src={isDarkMode ? logoWhite : logoBlack} 
            alt="Logo" 
            className={styles.logoImage} 
          />
        </div>
      </div>

      <nav className={styles.navSection}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                           (item.path.includes('/profile') && location.pathname.includes('/profile'));

          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`${styles.item} ${isActive ? styles.active : ''}`}
            >
              <div className={styles.iconContainer}>
                <Icon size={26} strokeWidth={isActive ? 2.5 : 1.5} />
                {item.badge && <div className={styles.redDot}></div>}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className={styles.bottomSection}>
        {isMenuOpen && <div className={styles.optionsWrapper}><OptionsMenu /></div>}
        <button className={styles.menuBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu 
            size={26} 
            color={isDarkMode ? (isMenuOpen ? "#f3f5f7" : "#4d4d4d") : (isMenuOpen ? "#000000" : "#4d4d4d")} 
          />
        </button>
      </div>
    </aside>
  );
};