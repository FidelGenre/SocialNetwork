"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { ThemeToggle } from '@/context/ThemeToggle'; 

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', formData);
      alert('¡Cuenta creada con éxito!');
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al intentar registrarse');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 relative">
      
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

        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Crea tu cuenta</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">Únete a la comunidad hoy mismo</p>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg text-center border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}
        
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider">Nombre</label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-border-color text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
              type="text"
              placeholder="Ej. Juan Pérez"
              value={formData.displayName}
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider">Usuario</label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-border-color text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
              type="text"
              placeholder="@usuario"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider">Email</label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-border-color text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
              type="email"
              placeholder="nombre@correo.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider">Contraseña</label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-border-color text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          {/* 👇 BOTÓN PREMIUM */}
          <button 
            type="submit" 
            className="w-full py-3.5 font-bold rounded-xl transition-transform active:scale-[0.98] mt-4 shadow-lg bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Registrarse
          </button>
        </form>

        <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-gray-900 dark:text-white font-bold hover:underline">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}