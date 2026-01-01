import styles from './Widgets.module.css';
import { Search } from 'lucide-react';

const Widgets = () => {
  return (
    <div className={styles.widgets}>
      <div className={styles.searchBar}>
        <Search size={18} className={styles.searchIcon} />
        <input type="text" placeholder="Buscar en la red" />
      </div>

      <div className={styles.card}>
        <h3>Tendencias para ti</h3>
        <div className={styles.trendItem}>
          <span>Tecnología · Tendencia</span>
          <p>#SpringBoot</p>
        </div>
        <div className={styles.trendItem}>
          <span>Programación · Tendencia</span>
          <p>#ReactJS</p>
        </div>
      </div>

      <div className={styles.card}>
        <h3>Sugerencias</h3>
        <div className={styles.followSuggestion}>
          <div className={styles.miniAvatar}></div>
          <div>
            <p>Admin</p>
            <span>@admin_red</span>
          </div>
          <button>Seguir</button>
        </div>
      </div>
    </div>
  );
};

export default Widgets;