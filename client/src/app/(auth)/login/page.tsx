"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api'; 
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/context/ThemeToggle'; 

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data); 
      router.push('/'); 
    } catch (err: any) {
      console.error("Error en login:", err);
      
      // 👇 AQUÍ ESTÁ LA SOLUCIÓN ANTI-CRASH
      // Verificamos qué nos devolvió el servidor para extraer solo el texto
      let errorMsg = 'Credenciales inválidas';

      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
            errorMsg = data; // Si el backend devuelve texto plano
        } else if (typeof data === 'object') {
            // Si devuelve JSON tipo { message: "Error..." } o { error: "Error..." }
            errorMsg = data.message || data.error || 'Error desconocido';
        }
      }
      
      setError(errorMsg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 relative">
      
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-feed-bg p-8 rounded-2xl shadow-xl border border-border-color">
        
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-gray-100 dark:bg-neutral-800 rounded-full">
            <Image 
              src="/assets/box.png" 
              alt="Logo App" 
              width={48} 
              height={48} 
              className="object-contain"
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Inicia sesión</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">Bienvenido de nuevo</p>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg text-center border border-red-100 dark:border-red-900/30">
            {/* Ahora estamos seguros de que {error} es un string y no romperá React */}
            {error}
          </div>
        )}
        
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider">Usuario</label>
            <input 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-border-color text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500" 
              type="text" 
              placeholder="Ej: fidelgenre" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider">Contraseña</label>
            <input 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-border-color text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 font-bold rounded-xl transition-transform active:scale-[0.98] mt-4 shadow-lg bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Entrar
          </button>
        </form>

        <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-gray-900 dark:text-white font-bold hover:underline">
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}