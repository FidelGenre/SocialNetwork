"use client";

import { useState, useEffect } from 'react';
import { Heart, UserPlus, MessageCircle, Repeat2 } from 'lucide-react';
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
        const response = await api.get(`/activities/${user.username}`);
        setActivities(response.data);
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

  // Renderizado del Badge
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
    <div className="w-full min-h-screen pb-20 relative">
      
      {/* 1. HEADER STICKY (Estilo Consistente) */}
      <header className="sticky top-0 z-50 w-full border-b border-border-color bg-background/85 backdrop-blur-xl">
         <div className="flex justify-center items-center h-[50px] px-4">
             <span className="font-bold text-[17px]">Actividad</span>
         </div>
      </header>

      {/* 2. CONTENEDOR "CARD" (El estilo que buscabas) */}
      <div className="mt-4 mx-0 md:mx-2 rounded-3xl overflow-hidden bg-[var(--feed-bg)] border border-border-color/20 relative z-0 shadow-sm min-h-[calc(100vh-100px)]">

        {/* FILTROS (Sticky dentro de la Card) */}
        {/* bg-[var(--feed-bg)] asegura que el fondo sea igual al de la tarjeta al hacer scroll */}
        <div className="sticky top-0 z-10 bg-[var(--feed-bg)] pt-4 pb-2 px-4 border-b border-border-color/10">
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
             {filters.map((f) => (
               <button
                 key={f.id}
                 onClick={() => setFilter(f.id)}
                 className={`flex-shrink-0 px-6 py-1.5 rounded-xl font-bold text-[15px] border transition-all ${
                     filter === f.id
                      ? 'bg-foreground text-background border-transparent' 
                      : 'bg-transparent text-gray-500 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                 }`}
               >
                 {f.label}
               </button>
             ))}
           </div>
        </div>

        {/* LISTA DE NOTIFICACIONES */}
        <div className="flex flex-col pb-4">
           {loading ? (
               <div className="p-8 text-center text-gray-500">Cargando actividad...</div>
           ) : filteredActivities.length === 0 ? (
               <div className="p-12 text-center text-gray-500">No hay actividad reciente.</div>
           ) : (
               filteredActivities.map((act) => (
                 <div 
                   key={act.id} 
                   className={`flex gap-4 p-4 border-b border-border-color/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${!act.read ? 'bg-blue-500/5' : ''}`}
                   onClick={() => {
                      if (act.post) router.push(`/post/${act.post.id}`);
                      else router.push(`/${act.actor.username}`);
                   }}
                 >
                   {/* AVATAR + BADGE */}
                   <div className="relative flex-shrink-0">
                       <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-border-color/30">
                           {act.actor.avatarUrl ? (
                              <img src={getFullAvatarUrl(act.actor.avatarUrl)} className="w-full h-full object-cover" alt="avatar"/>
                           ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 bg-gray-100">
                                  {act.actor.username[0].toUpperCase()}
                              </div>
                           )}
                       </div>
                       <div className="absolute -bottom-1 -right-1 border-2 border-[var(--feed-bg)] rounded-full">
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
                               {/* Fecha relativa si la tienes */}
                           </span>
                       </div>
                       
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

                   {/* MINIATURA DE IMAGEN */}
                   {act.post?.imageUrl && act.type !== 'FOLLOW' && (
                       <div className="w-10 h-10 rounded-lg overflow-hidden border border-border-color/20 flex-shrink-0">
                           <img src={getFullAvatarUrl(act.post.imageUrl)} className="w-full h-full object-cover" alt="post"/>
                       </div>
                   )}

                 </div>
               ))
           )}
        </div>

      </div>
    </div>
  );
}