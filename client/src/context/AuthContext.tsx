"use client"; // 👈 OBLIGATORIO: Los contextos siempre son del cliente

import React, { createContext, useState, useContext, useEffect } from 'react';

// Si tienes este tipo definido en un archivo types.ts, impórtalo mejor desde ahí
export interface User {
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string; // Agregué esto que suele ser útil
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean; // Útil para no mostrar la app hasta saber si hay usuario
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ CORRECCIÓN PARA NEXT.JS:
  // Leemos localStorage solo dentro de useEffect (solo ocurre en el navegador)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== "undefined") {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing user from storage");
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Opcional: Redirigir al login usando router.push('/login') aquí
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};