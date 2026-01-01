import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; 
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data); // Guarda el usuario en el estado global
      navigate('/profile'); 
    } catch (err: any) {
      setError(err.response?.data || 'Credenciales inválidas');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>✦</div>
        <h2>Inicia sesión</h2>
        {error && <p style={{ color: '#ff4444', fontSize: '14px' }}>{error}</p>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <input className={styles.input} type="text" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input className={styles.input} type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className={styles.loginBtn}>Entrar</button>
        </form>
        <div className={styles.footer}>¿No tienes cuenta? <Link to="/register">Regístrate</Link></div>
      </div>
    </div>
  );
};

export default Login;