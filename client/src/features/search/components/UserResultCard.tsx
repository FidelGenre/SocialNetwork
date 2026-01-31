"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { getAvatarUrl } from '@/lib/utils'; // Usamos tu utilidad centralizada

interface UserResultCardProps {
  user: any;
  onClose?: () => void;
}

export const UserResultCard = ({ user, onClose }: UserResultCardProps) => {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Verificar si ya lo sigo al cargar el componente
  useEffect(() => {
    if (currentUser && user?.followers) {
      // Buscamos si mi username está en su lista de seguidores
      const alreadyFollowing = user.followers.some(
        (follower: any) => follower.username === currentUser.username
      );
      setIsFollowing(alreadyFollowing);
    }
  }, [currentUser, user]);

  // 2. Manejar el click en Seguir/Dejar de seguir
  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita navegar al perfil al dar click al botón
    if (!currentUser) return;

    setLoading(true);
    // Optimismo: Cambiamos la UI antes de que responda el servidor
    const previousState = isFollowing;
    setIsFollowing(!isFollowing);

    try {
      await api.post(`/users/${user.username}/follow?followerUsername=${currentUser.username}`);
      // Si el backend responde bien, el estado ya está actualizado.
    } catch (error) {
      console.error("Error al seguir:", error);
      setIsFollowing(previousState); // Revertimos si falla
    } finally {
      setLoading(false);
    }
  };

  const goToProfile = () => {
    router.push(`/${user.username}`);
    if (onClose) onClose();
  };

  // No mostrar botón si soy yo mismo
  const isMe = currentUser?.username === user.username;

  return (
    <div 
      onClick={goToProfile}
      className="flex items-center justify-between px-4 py-4 border-b border-border-color/40 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
    >
      {/* Info Usuario */}
      <div className="flex items-center gap-3">
        {/* Avatar con protección anti-errores */}
        <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden border border-border-color">
          <img 
            src={getAvatarUrl(user.avatarUrl)} 
            className="w-full h-full object-cover" 
            alt={user.username}
            onError={(e) => e.currentTarget.src = '/assets/default_profile_400x400.png'}
          />
        </div>

        <div className="flex flex-col">
           <span className="font-bold text-[15px] leading-tight">
              {user.username}
           </span>
           <span className="text-gray-500 text-[15px] leading-tight">
              {user.displayName || user.username}
           </span>
           <span className="text-gray-500 text-sm mt-0.5">
              {user.followers?.length || 0} seguidores
           </span>
        </div>
      </div>

      {/* Botón Acción Inteligente */}
      {!isMe && (
        <button 
          onClick={handleFollow}
          disabled={loading}
          className={`px-5 py-1.5 rounded-xl border font-bold text-[14px] transition-all ${
            isFollowing
              ? 'border-border-color text-gray-500 hover:text-red-500 hover:border-red-200 bg-transparent' // Estilo "Siguiendo"
              : 'border-border-color hover:bg-gray-100 dark:hover:bg-white/10 bg-transparent' // Estilo "Seguir"
          }`}
        >
          {loading ? '...' : (isFollowing ? 'Siguiendo' : 'Seguir')}
        </button>
      )}
    </div>
  );
};