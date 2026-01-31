"use client";

import { useState } from 'react';
import { Home, Search, MessageCircle, Heart, User, Plus, Menu, LogOut, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { CreatePostModal } from '@/features/posts/components/CreatePostModal';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // 1. LISTA LIMPIA (Sin botón Crear)
  const navItems = [
    { icon: Home, path: '/', label: 'Inicio' },
    { icon: Search, path: '/explore', label: 'Explorar' },
    { icon: MessageCircle, path: '/messages', label: 'Mensajes' },
    { icon: Heart, path: '/notifications', label: 'Notificaciones' },
    { icon: User, path: user ? `/${user.username}` : '/login', label: 'Perfil' },
  ];

  const logoSrc = theme === 'dark' ? '/assets/box.png' : '/assets/766753.png';

  return (
    <>
      {/* --- DESKTOP SIDEBAR (Barra Izquierda) --- */}
      <aside className="fixed top-0 left-0 h-screen w-[80px] flex-col hidden md:flex bg-background border-r border-border-color/40 z-50">
        
        {/* Logo */}
        <div className="h-24 flex items-center justify-center">
           <Link href="/" className="hover:scale-110 transition-transform">
             <Image src={logoSrc} alt="Logo" width={32} height={32} />
           </Link>
        </div>

        {/* Navegación */}
        <nav className="flex-1 flex flex-col justify-center items-center gap-6"> 
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.path ? pathname === item.path : false;
            return (
              <Link 
                key={index}
                href={item.path!}
                className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
                    isActive 
                      ? 'bg-foreground text-background' 
                      : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-foreground'
                }`}
                title={item.label}
              >
                <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
              </Link>
            );
          })}
        </nav>

        {/* Menú Más */}
        <div className="h-24 flex items-center justify-center relative">
             <button 
               onClick={() => setIsMenuOpen(!isMenuOpen)}
               className="w-12 h-12 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-foreground transition-all"
             >
                <Menu size={28} strokeWidth={2} />
             </button>
             
             {isMenuOpen && (
                <div className="absolute bottom-4 left-14 w-60 bg-background border border-border-color rounded-2xl shadow-xl p-2 z-50 ml-2">
                    <button onClick={toggleTheme} className="flex items-center gap-3 w-full p-3.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-foreground">
                        {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
                        <span className="font-medium">Cambiar aspecto</span>
                    </button>
                    <div className="h-px bg-border-color my-1"></div>
                    <button onClick={() => { logout(); window.location.href='/login'}} className="flex items-center gap-3 w-full p-3.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 font-bold">
                        <LogOut size={20}/>
                        <span>Cerrar sesión</span>
                    </button>
                </div>
             )}
        </div>
      </aside>

      {/* --- BOTÓN FLOTANTE (Visible en Móvil Y Desktop) --- */}
      {/* bottom-20 en móvil (para no tapar la barra) | bottom-10 en PC */}
      <button 
        onClick={() => setIsCreateOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-10 md:right-10 z-50 bg-foreground text-background p-4 md:p-5 rounded-2xl shadow-xl hover:scale-105 transition-transform active:scale-95 cursor-pointer"
        aria-label="Crear post"
      >
        <Plus size={28} strokeWidth={3} />
      </button>

      {/* --- MOBILE NAVBAR (Barra Inferior) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-[60px] bg-background border-t border-border-color flex justify-around items-center z-50 px-2 pb-safe">
        {navItems.map((item, index) => {
           const Icon = item.icon;
           const isActive = item.path ? pathname === item.path : false;
           return (
             <Link 
               key={index}
               href={item.path!}
               className={`p-3 rounded-lg transition-all ${
                   isActive ? 'text-foreground' : 'text-gray-400'
               }`}
             >
               <Icon size={28} strokeWidth={isActive ? 2.5 : 2} />
             </Link>
           )
        })}
      </nav>

      {/* MODAL GLOBAL */}
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