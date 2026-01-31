"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PostEditor } from '@/features/posts/components/PostEditor';
import { PostCard } from '@/features/posts/components/PostCard';
import api from '@/lib/api';
import Image from 'next/image';

interface Post {
  id: string;
  content: string;
  createdAt: string;
  likesCount: number;
  repliesCount: number;
  repostsCount: number;
  imageUrl?: string;
  repostFromUserName?: string;
  likedByUsers?: { username: string }[];
  user?: {
    displayName?: string;
    username: string;
    avatarUrl?: string;
  };
}

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'FOR_YOU' | 'FOLLOWING'>('FOR_YOU');
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!user && activeTab === 'FOLLOWING') return;

    try {
      setLoading(true);
      let response;

      if (activeTab === 'FOLLOWING') {
        // 1. Endpoint específico para seguidos
        // NOTA: Tu backend debe tener esta ruta habilitada. 
        // Si no existe, fallará y mostrará la lista vacía (correcto).
        response = await api.get(`/posts/following/${user?.username}`);
      } else {
        // 2. Endpoint general (Para ti)
        response = await api.get('/posts');
      }
      
      setPosts(response.data);

    } catch (error) {
      console.error("Error cargando el feed:", error);
      // 3. IMPORTANTE: He quitado el "fallback" que cargaba todos los posts si fallaba.
      // Si falla, mostramos lista vacía para no confundir al usuario.
      setPosts([]); 
    } finally {
      setLoading(false);
    }
  }, [activeTab, user]);

  useEffect(() => {
    fetchPosts();
    const handleGlobalUpdate = () => fetchPosts();
    if (typeof window !== 'undefined') {
        window.addEventListener('postCreatedGlobal', handleGlobalUpdate);
    }
    return () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('postCreatedGlobal', handleGlobalUpdate);
        }
    };
  }, [fetchPosts]);

  return (
    <div className="w-full min-h-screen pb-20 relative">
      
      {/* HEADER STICKY */}
      <header className="sticky top-0 z-50 w-full border-b border-border-color bg-background/85 backdrop-blur-xl transition-all">
         <div className="md:hidden flex justify-center pt-2 pb-1">
             <Image src="/assets/766753.png" width={28} height={28} alt="logo" className="dark:invert opacity-80" />
         </div>

         <div className="flex justify-around md:justify-center md:gap-20 items-end h-[50px] px-4">
            <button 
              onClick={() => setActiveTab('FOR_YOU')}
              className={`pb-3 px-4 font-bold text-[15px] transition-colors relative ${
                  activeTab === 'FOR_YOU' ? 'text-foreground' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
               Para ti
               {activeTab === 'FOR_YOU' && (
                   <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-foreground rounded-full animate-in fade-in zoom-in" />
               )}
            </button>

            <button 
              onClick={() => setActiveTab('FOLLOWING')}
              className={`pb-3 px-4 font-bold text-[15px] transition-colors relative ${
                  activeTab === 'FOLLOWING' ? 'text-foreground' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
               Siguiendo
               {activeTab === 'FOLLOWING' && (
                   <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-foreground rounded-full animate-in fade-in zoom-in" />
               )}
            </button>
         </div>
      </header>

      {/* CONTENEDOR FEED */}
      <div className="mt-4 mx-0 md:mx-2 rounded-3xl overflow-hidden bg-[var(--feed-bg)] border border-border-color/20 relative z-0 shadow-sm">
          
          {/* Editor (Solo visible en Para Ti o si quieres postear siempre) */}
          <div className="hidden md:block px-4 py-4 border-b border-border-color/20">
             <PostEditor onPostCreated={fetchPosts} />
          </div>

          {/* Lista de posts */}
          <main className="flex flex-col min-h-[200px]">
            {loading ? (
                 <div className="py-20 flex justify-center">
                     <div className="animate-pulse flex flex-col items-center gap-2">
                         <div className="h-4 w-4 bg-foreground rounded-full animate-bounce"></div>
                         <span className="text-gray-500 text-sm">Cargando...</span>
                     </div>
                 </div>
            ) : posts.length > 0 ? (
                 posts.map((post, index) => (
                     <PostCard 
                        key={post.id} 
                        {...post} 
                        isLast={index === posts.length - 1} 
                     />
                 ))
            ) : (
                 <div className="py-20 text-center text-gray-500 px-6">
                     {activeTab === 'FOLLOWING' ? (
                        <>
                           <p className="text-lg font-bold mb-2">Aún no sigues a nadie</p>
                           <p className="text-sm mb-4">Sigue a otros usuarios para ver sus publicaciones aquí.</p>
                           <button onClick={() => setActiveTab('FOR_YOU')} className="text-blue-500 hover:underline text-sm font-semibold">
                               Ir a Explorar "Para ti"
                           </button>
                        </>
                     ) : (
                        <>
                           <p className="text-lg font-medium mb-2">¡Bienvenido!</p>
                           <p className="text-sm">Sé el primero en publicar algo.</p>
                        </>
                     )}
                 </div>
            )}
          </main>
      
      </div> 
    </div>
  );
}