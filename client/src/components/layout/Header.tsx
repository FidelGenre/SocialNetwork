"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
// 👇 AQUÍ ESTABA EL ERROR: Faltaban importar estos iconos
import { Home, Search, Heart, User, PlusSquare, Menu, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { CreatePostModal } from '@/features/posts/components/CreatePostModal';

export const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Iconos de navegación centrados
  const navItems = [
    { icon: Home, path: '/', activePath: '/' },
    { icon: Search, path: '/explore', activePath: '/explore' },
    // El botón del medio abre el Modal
    { icon: PlusSquare, action: () => setIsCreateOpen(true), special: true },
    { icon: Heart, path: '/notifications', activePath: '/notifications' },
    { icon: User, path: user ? `/${user.username}` : '/login', activePath: '/profile' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-[74px] bg-background/85 backdrop-blur-xl z-50 flex items-center justify-between px-6 sm:px-12 border-b border-border-color/50">
        
        {/* IZQUIERDA: Logo */}
        <div className="flex-1">
          <Link href="/" className="block w-8 hover:scale-110 transition-transform">
             <Image 
               src={theme === 'dark' ? '/assets/box.png' : '/assets/766753.png'} 
               alt="Logo" 
               width={32} 
               height={32} 
             />
          </Link>
        </div>

        {/* CENTRO: Navegación Principal */}
        <nav className="flex-1 flex justify-center gap-1 sm:gap-8">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            // Verificar si el item está activo
            const isActive = item.path ? pathname === item.path : false;
            
            // Renderizado especial para el botón "+"
            if (item.special) {
              return (
                <button 
                  key={index}
                  onClick={item.action}
                  className="p-4 sm:p-5 text-gray-400 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all"
                >
                  <Icon size={26} strokeWidth={2} />
                </button>
              );
            }

            // Renderizado normal para enlaces
            return (
              <Link 
                key={index} 
                href={item.path!} 
                className={`p-4 sm:p-5 rounded-xl transition-all ${
                  isActive ? 'text-foreground' : 'text-gray-400 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <Icon 
                  size={isActive ? 28 : 26} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  // Relleno si está activo (Estilo Threads)
                  fill={isActive ? 'currentColor' : 'none'} 
                />
              </Link>
            );
          })}
        </nav>

        {/* DERECHA: Menú Hamburguesa */}
        <div className="flex-1 flex justify-end relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-lg transition-colors ${isMenuOpen ? 'text-foreground' : 'text-gray-500 hover:text-foreground'}`}
          >
            <Menu size={28} />
          </button>

          {/* Menú Flotante */}
          {isMenuOpen && (
            <div className="absolute top-12 right-0 bg-background border border-border-color rounded-2xl shadow-2xl p-2 w-56 animate-in fade-in zoom-in-95 overflow-hidden">
               
               {/* Opción: Cambiar Tema */}
               <button 
                 onClick={() => { toggleTheme(); setIsMenuOpen(false); }} 
                 className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-sm font-medium text-foreground"
               >
                 {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                 <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
               </button>

               <div className="h-px bg-border-color my-1"></div>
               
               {/* Opción: Cerrar Sesión */}
               <button 
                 onClick={() => { 
                    logout(); 
                    window.location.href='/login'; 
                 }} 
                 className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 text-sm font-bold transition-colors"
               >
                 <LogOut size={18} />
                 <span>Cerrar sesión</span>
               </button>
            </div>
          )}
        </div>
      </header>

      {/* Modal de Crear Post */}
      {isCreateOpen && (
        <CreatePostModal 
            onClose={() => setIsCreateOpen(false)} 
            onPost={() => {
                setIsCreateOpen(false);
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('postCreatedGlobal'));
                }
            }} 
        />
      )}
    </>
  );
};