"use client";

import { useState, useEffect } from 'react';
import { Heart, UserPlus, MessageCircle, Repeat2, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

// Utilidad para imagen
const getFullAvatarUrl = (url: string | undefined) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `https://socialnetworkserver-3kyu.onrender.com${url}`;
};

export default function ActivityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Mapeo de Filtros
  const filters = [
    { id: 'ALL', label: 'Todo' },
    { id: 'FOLLOW', label: 'Seguimientos' },
    { id: 'LIKE', label: 'Likes' },
    { id: 'REPLY', label: 'Respuestas' },
    { id: 'REPOST', label: 'Republicaciones' },
  ];

  useEffect(() => {
    const fetchAndRead = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // 1. Obtener notificaciones
        const response = await api.get(`/activities/${user.username}`);
        setActivities(response.data);

        // 2. Marcar como leído (Limpia el punto rojo en la barra)
        await api.patch(`/activities/read?username=${user.username}&type=GENERAL`);
      } catch (error) {
        console.error("Error actividad:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndRead();
  }, [user]);

  // Filtrado
  const filteredActivities = filter === 'ALL' 
    ? activities 
    : activities.filter(a => a.type === filter);

  // Renderizado del Badge (Icono pequeño sobre el avatar)
  const renderBadge = (type: string) => {
    switch (type) {
      case 'FOLLOW':
        return <div className="bg-[#5c5cff] p-1 rounded-full"><UserPlus size={12} className="text-white" /></div>;
      case 'LIKE':
        return <div className="bg-[#ff3040] p-1 rounded-full"><Heart size={12} className="text-white fill-white" /></div>;
      case 'REPOST':
        return <div className="bg-[#00ba7c] p-1 rounded-full"><Repeat2 size={12} className="text-white" /></div>;
      case 'REPLY':
        return <div className="bg-[#0095f6] p-1 rounded-full"><MessageCircle size={12} className="text-white fill-white" /></div>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[620px] mx-auto min-h-screen pb-20">
      
      {/* 1. FILTROS (Estilo Píldora Scrollable) */}
      <div className="sticky top-0 bg-background/95 backdrop-blur z-20 pt-4 pb-2 px-4 border-b border-transparent">
         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex-shrink-0 px-6 py-1.5 rounded-xl font-bold text-[15px] border transition-all ${
                    filter === f.id
                     ? 'bg-foreground text-background border-transparent' // Activo: Negro/Blanco solido
                     : 'bg-transparent text-gray-500 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600' // Inactivo: Borde gris
                }`}
              >
                {f.label}
              </button>
            ))}
         </div>
      </div>

      {/* 2. LISTA DE NOTIFICACIONES */}
      <div className="flex flex-col">
         {loading ? (
             <div className="p-8 text-center text-gray-500">Cargando actividad...</div>
         ) : filteredActivities.length === 0 ? (
             <div className="p-12 text-center text-gray-500">No hay actividad reciente.</div>
         ) : (
             filteredActivities.map((act) => (
               <div 
                 key={act.id} 
                 className={`flex gap-4 p-4 border-b border-border-color/40 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${!act.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                 onClick={() => {
                    // Si es un post, ir al post. Si es follow, ir al perfil.
                    if (act.post) router.push(`/post/${act.post.id}`);
                    else router.push(`/${act.actor.username}`);
                 }}
               >
                  {/* AVATAR + BADGE */}
                  <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-border-color">
                         {act.actor.avatarUrl ? (
                            <img src={getFullAvatarUrl(act.actor.avatarUrl)} className="w-full h-full object-cover" alt="avatar"/>
                         ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                                {act.actor.username[0].toUpperCase()}
                            </div>
                         )}
                      </div>
                      
                      {/* Icono superpuesto en la esquina */}
                      <div className="absolute -bottom-1 -right-1 border-2 border-background rounded-full">
                          {renderBadge(act.type)}
                      </div>
                  </div>

                  {/* CONTENIDO TEXTO */}
                  <div className="flex-1 flex flex-col justify-center">
                      <div className="text-[15px] leading-snug">
                          <span className="font-bold mr-1">{act.actor.username}</span>
                          <span className="text-gray-500">
                              {act.type === 'FOLLOW' && 'empezó a seguirte'}
                              {act.type === 'LIKE' && 'indicó que le gusta tu post'}
                              {act.type === 'REPOST' && 'reposteó tu hilo'}
                              {act.type === 'REPLY' && 'respondió a tu hilo'}
                          </span>
                          <span className="text-gray-400 text-sm ml-2">
                             {/* Aquí podrías poner la fecha si tu API la devuelve (ej: "2h") */}
                          </span>
                      </div>
                      
                      {/* Preview del texto (si es like/reply/repost) */}
                      {act.post && (
                          <div className="text-gray-400 text-sm line-clamp-1 mt-0.5">
                              {act.post.content}
                          </div>
                      )}
                  </div>

                  {/* BOTÓN SEGUIR (Solo si es tipo FOLLOW) */}
                  {act.type === 'FOLLOW' && (
                      <div className="flex items-center">
                          <button className="px-4 py-1.5 rounded-xl border border-border-color font-bold text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                              Seguir
                          </button>
                      </div>
                  )}

                  {/* MINIATURA DE IMAGEN (Si el post tenía foto) */}
                  {act.post?.imageUrl && act.type !== 'FOLLOW' && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-border-color flex-shrink-0">
                          <img src={getFullAvatarUrl(act.post.imageUrl)} className="w-full h-full object-cover" alt="post"/>
                      </div>
                  )}

               </div>
             ))
         )}
      </div>

    </div>
  );
}