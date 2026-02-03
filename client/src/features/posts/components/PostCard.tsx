"use client";

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Repeat2, Send, Trash2, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { CreatePostModal } from './CreatePostModal';
import { getAvatarUrl } from '@/lib/utils';

const formatTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'ahora';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

export interface PostCardProps {
  id: string; 
  content: string;
  imageUrl?: string;
  createdAt: string; 
  likesCount: number;
  repliesCount: number;
  repostsCount: number;
  repostFromUserName?: string;
  likedByUsers?: { username: string }[]; 
  repostedByUsers?: { username: string }[]; 
  user?: {
    displayName?: string;
    username: string;
    avatarUrl?: string;
  };
  isLast?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  id, content, imageUrl, createdAt, likesCount: initialLikes, 
  repliesCount, repostsCount: initialReposts, repostFromUserName, likedByUsers, repostedByUsers, user, isLast 
}) => {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  
  // Estados para Likes
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  // Estados para Reposts
  const [reposts, setReposts] = useState(initialReposts);
  const [isReposted, setIsReposted] = useState(false);

  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getFullUrl = (url: string | undefined) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;

    let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    if (baseUrl.endsWith('/api')) baseUrl = baseUrl.slice(0, -4);
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
  };

  // Efecto para verificar estado inicial (Like y Repost)
  useEffect(() => {
    if (currentUser) {
        if (likedByUsers) {
            setIsLiked(likedByUsers.some(u => u.username === currentUser.username));
        }
        
        // Detección mejorada de Repost
        const isInRepostList = repostedByUsers?.some(u => u.username === currentUser.username);
        const isMyOwnRepostCard = user?.username === currentUser.username && !!repostFromUserName;

        if (isInRepostList || isMyOwnRepostCard) {
            setIsReposted(true);
        }
    }
  }, [likedByUsers, repostedByUsers, currentUser, user, repostFromUserName]);

  // Manejador de Like
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    const previousLiked = isLiked;
    const previousLikes = likes;
    
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    
    try {
        await api.patch(`/posts/${id}/like?username=${currentUser.username}`);
    } catch (e) {
      setIsLiked(previousLiked);
      setLikes(previousLikes);
      console.error("Error like:", e);
    }
  };

  // Manejador de Repost
  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;

    const previousReposted = isReposted;
    const previousReposts = reposts;

    setIsReposted(!isReposted);
    setReposts(prev => isReposted ? prev - 1 : prev + 1);

    try {
        await api.post(`/posts/${id}/repost?username=${currentUser.username}`);
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('postCreatedGlobal'));
    } catch (e) {
        setIsReposted(previousReposted);
        setReposts(previousReposts);
        console.error("Error repost:", e);
        alert("Error al repostear");
    }
  };

  // Manejador de Compartir
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const postUrl = `${window.location.origin}/post/${id}`;
    
    try {
        await navigator.clipboard.writeText(postUrl);
        alert("📋 ¡Enlace copiado al portapapeles!");
    } catch (err) {
        console.error("Error al copiar:", err);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);

    if (!currentUser?.username) return;
    if (!window.confirm("¿Estás seguro de que quieres eliminar este post?")) return;
    
    try {
        await api.delete(`/posts/${id}`, {
            params: { username: currentUser.username },
            data: { username: currentUser.username }
        });
        router.refresh();
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('postCreatedGlobal'));
    } catch(e: any) { 
        console.error("Error al borrar:", e.response?.data || e.message);
    }
  }

  const goToPost = () => router.push(`/post/${id}`);
  const goToProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user?.username) router.push(`/${user.username}`);
  };

  return (
    <article 
        onClick={goToPost}
        className={`flex gap-4 px-4 pt-4 cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors relative ${!isLast ? 'border-b border-border-color/60' : ''}`}
    >
      <div className="flex flex-col items-center flex-shrink-0 w-11">
          <div 
             onClick={goToProfile}
             className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden border border-border-color z-10 relative hover:opacity-90 transition-opacity"
          >
              <img 
                src={getAvatarUrl(user?.avatarUrl)} 
                alt={user?.username || 'User'} 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/assets/default_profile_400x400.png'; }}
              />
          </div>
      </div>

      <div className="flex-1 min-w-0 pb-2">
          <div className="flex justify-between items-start">
             <div className="flex-1 min-w-0">
                  {repostFromUserName && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-bold mb-1 -ml-1">
                      <Repeat2 size={12} />
                      <span>{repostFromUserName} reposteó</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 truncate text-[15px]">
                      <span onClick={goToProfile} className="font-bold text-foreground hover:underline cursor-pointer truncate">
                          {user?.displayName || user?.username}
                      </span>
                      <span className="text-gray-500 truncate">@{user?.username}</span>
                      <span className="text-gray-500 text-sm flex-shrink-0 whitespace-nowrap">· {formatTime(createdAt)}</span>
                  </div>
             </div>
              
              <div className="relative -mr-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors"
                  >
                      <MoreHorizontal size={18} />
                  </button>
                  {showMenu && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
                        <div className="absolute right-0 top-8 z-20 w-40 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden py-1">
                            {currentUser?.username === user?.username ? (
                                <button onClick={handleDelete} className="w-full text-left px-4 py-3 text-sm text-red-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
                                    <Trash2 size={16} /> Eliminar
                                </button>
                            ) : (
                                <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
                                    Reportar
                                </button>
                            )}
                        </div>
                    </>
                  )}
              </div>
          </div>

          <p className="text-[15px] leading-relaxed mt-0.5 whitespace-pre-wrap break-words text-foreground">
              {content}
          </p>

          {imageUrl && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                  <img src={getFullUrl(imageUrl)} alt="Post" className="w-full h-auto" loading="lazy" />
              </div>
          )}

          {/* FOOTER ACCIONES */}
          <div className="flex items-center justify-between mt-3 w-full max-w-md">
              
              {/* 1. RESPONDER */}
              <button 
                onClick={(e) => { e.stopPropagation(); setIsReplyModalOpen(true); }} 
                className="group flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors flex-1"
                title="Responder"
              >
                  <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors relative">
                    <MessageCircle size={18} />
                  </div>
                  <span className={`text-xs font-medium transition-opacity ${repliesCount > 0 ? 'opacity-100' : 'opacity-0'}`}>
                    {repliesCount > 0 ? repliesCount : '0'}
                  </span>
              </button>

              {/* 2. REPOSTEAR */}
              <button 
                onClick={handleRepost} 
                className={`group flex items-center gap-1 transition-colors flex-1 ${isReposted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'}`}
                title="Repostear"
              >
                  <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                    <Repeat2 size={18} className={isReposted ? "stroke-2" : ""} />
                  </div>
                  <span className={`text-xs font-medium transition-opacity ${reposts > 0 ? 'opacity-100' : 'opacity-0'}`}>
                    {reposts > 0 ? reposts : '0'}
                  </span>
              </button>

              {/* 3. ME GUSTA */}
              <button 
                onClick={handleLike} 
                className={`group flex items-center gap-1 transition-colors flex-1 ${isLiked ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'}`}
                title="Me gusta"
              >
                  <div className="p-2 rounded-full group-hover:bg-pink-600/10 transition-colors">
                    <Heart size={18} className={isLiked ? "fill-current" : ""} />
                  </div>
                  <span className={`text-xs font-medium transition-opacity ${likes > 0 ? 'opacity-100' : 'opacity-0'}`}>
                    {likes > 0 ? likes : '0'}
                  </span>
              </button>

              {/* 4. COMPARTIR */}
              <button 
                onClick={handleShare} 
                className="group flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors flex-1"
                title="Copiar enlace"
              >
                  <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                    <Send size={18} />
                  </div>
              </button>
          </div>
      </div>

      {isReplyModalOpen && (
        <CreatePostModal 
            onClose={() => setIsReplyModalOpen(false)} 
            parentId={id}
            // 👇 PASAMOS LOS DATOS DEL POST PARA EL ESTILO VISUAL DE HILO
            replyToPost={{
                id: id,
                content: content,
                user: user,
                createdAt: createdAt
            }}
            onPost={() => {
                setIsReplyModalOpen(false);
                if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('postCreatedGlobal'));
            }}
        />
      )}
    </article>
  );
};