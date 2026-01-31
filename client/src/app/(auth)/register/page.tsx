"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';

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
      setError(err.response?.data || 'Error al intentar registrarse');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
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

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Crea tu cuenta</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">Únete a la conversación hoy mismo</p>
        
        {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg text-center border border-red-100">
                {error}
            </div>
        )}
        
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
            type="text"
            placeholder="Nombre visible (ej. Juan Pérez)"
            value={formData.displayName}
            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
            required
          />
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
            type="text"
            placeholder="Usuario (@usuario)"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
            type="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          
          <button 
            type="submit" 
            className="w-full py-3 bg-sky-500 text-white font-bold rounded-full hover:bg-sky-600 transition-transform active:scale-[0.98] mt-4"
          >
            Registrarse
          </button>
        </form>

        <div className="mt-6 text-center text-gray-500 text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-sky-600 font-bold hover:underline">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}