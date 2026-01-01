import React, { createContext, useState, useContext } from 'react';

interface User {
  username: string;
  displayName: string;
  bio: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializamos el estado directamente desde localStorage para evitar el useEffect innecesario
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    
    // Validamos que exista y no sea la cadena corrupta "undefined"
    if (savedUser && savedUser !== "undefined") {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error("Error al parsear el usuario del storage");
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};