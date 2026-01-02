import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; // Asegúrate de que la ruta sea correcta
import styles from './Login.module.css'; // Usando tus estilos compartidos
import logoImg from '../assets/box.png'; 

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // Petición al backend que ya tenemos corriendo en el puerto 8080
      await api.post('/auth/register', formData);
      alert('¡Cuenta creada con éxito!');
      navigate('/login');
    } catch (err: any) {
      // Manejo de errores (ej: usuario duplicado)
      setError(err.response?.data || 'Error al intentar registrarse');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoContainer}>
          <img 
            src={logoImg}
            alt="Logo App" 
            className={styles.logoImage} 
          />
        </div>
        <h2>Crear cuenta en SocialNetwork</h2>
        
        {error && <p style={{ color: '#ff4444', marginBottom: '16px' }}>{error}</p>}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            placeholder="Nombre visible"
            value={formData.displayName}
            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
            required
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Nombre de usuario"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
          <input
            className={styles.input}
            type="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          
          <button type="submit" className={styles.loginBtn}>
            Registrarse
          </button>
        </form>

        <div className={styles.footer}>
          ¿Ya tienes cuenta? 
          <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;