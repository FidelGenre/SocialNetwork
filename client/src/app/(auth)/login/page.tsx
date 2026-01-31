"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api'; 
import { useAuth } from '@/context/AuthContext';

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
      router.push('/'); // Redirige al Home/Feed
    } catch (err: any) {
      setError(err.response?.data || 'Credenciales inválidas');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image 
            src="/assets/box.png" 
            alt="Logo App" 
            width={64} 
            height={64} 
            className="object-contain"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Inicia sesión</h2>
        
        {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg text-center border border-red-100">
                {error}
            </div>
        )}
        
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all" 
            type="text" 
            placeholder="Usuario" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
          <input 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all" 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button 
            type="submit" 
            className="w-full py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-black transition-transform active:scale-[0.98] mt-2"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 text-center text-gray-500 text-sm">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-sky-600 font-bold hover:underline">
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}