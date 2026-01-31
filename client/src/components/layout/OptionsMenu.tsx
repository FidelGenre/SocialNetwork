"use client";

import React from 'react';
import { LogOut, Settings, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext'; // 👈 Importamos el contexto
import { useRouter } from 'next/navigation';

export const OptionsMenu = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme(); // 👈 Obtenemos el estado y la función
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="absolute bottom-16 left-4 w-64 bg-white dark:bg-black rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-gray-100 dark:border-gray-800 overflow-hidden p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
      
      {/* Botón de Configuración (Placeholder) */}
      <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors text-left font-medium">
        <Settings size={20} />
        <span>Configuración</span>
      </button>

      {/* Botón de Tema (Funcional) */}
      <button 
        onClick={toggleTheme}
        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors text-left font-medium"
      >
        {/* Cambia el icono según el tema actual */}
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
      </button>

      <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>

      {/* Botón de Cerrar Sesión */}
      <button 
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-left font-bold"
      >
        <LogOut size={20} />
        <span>Cerrar sesión</span>
      </button>
    </div>
  );
};