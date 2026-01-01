import React, { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Search.module.css';

export const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const performSearch = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }

      try {
        // Sincronizado con el parámetro 'q' del backend
        const response = await api.get(`/users/search?q=${query}`);
        setResults(response.data);
      } catch (error) {
        console.error("Error buscando usuarios:", error);
      }
    };

    // Mantenemos tu Debounce de 300ms
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Búsqueda</h1>
      
      <div className={styles.searchBar}>
        <SearchIcon className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder="Buscar usuarios por nombre o @usuario..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.input}
          autoFocus
        />
      </div>

      <div className={styles.resultsList}>
        {results.length > 0 ? (
          results.map((user) => (
            <div 
              key={user.id} 
              className={styles.userRow}
              onClick={() => navigate(`/profile/${user.username}`)}
            >
              <div className={styles.userInfo}>
                <div className={styles.avatarMini}>
                  {user.displayName?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
                </div>
                <div className={styles.details}>
                  <span className={styles.displayName}>{user.displayName || user.username}</span>
                  <span className={styles.username}>@{user.username}</span>
                </div>
              </div>
              <button className={styles.viewBtn}>Ver perfil</button>
            </div>
          ))
        ) : (
          query.trim().length > 0 && (
            <p className={styles.empty}>No se encontraron resultados para "{query}"</p>
          )
        )}
      </div>
    </div>
  );
};

export default Search;