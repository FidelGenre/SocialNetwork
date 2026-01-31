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
  user?: {
    displayName?: string;
    username: string;
    avatarUrl?: string;
  };
  isLast?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  id, content, imageUrl, createdAt, likesCount: initialLikes, 
  repliesCount, repostsCount: initialReposts, repostFromUserName, likedByUsers, user, isLast 
}) => {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  const getFullUrl = (url: string | undefined) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `https://socialnetworkserver-3kyu.onrender.com${url}`;
  };

  useEffect(() => {
    if (likedByUsers && currentUser) {
        setIsLiked(likedByUsers.some(u => u.username === currentUser.username));
    }
  }, [likedByUsers, currentUser]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    try {
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? prev - 1 : prev + 1);
      
      if (!isLiked) {
          await api.post(`/posts/${id}/like?username=${currentUser.username}`);
      } else {
          await api.delete(`/posts/${id}/like?username=${currentUser.username}`);
      }
    } catch (e) {
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? prev + 1 : prev - 1);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Borrar post?")) return;
    try {
        await api.delete(`/posts/${id}?username=${currentUser?.username}`);
        router.refresh();
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('postCreatedGlobal'));
    } catch(e) { console.error(e); }
  }

  const goToPost = () => router.push(`/post/${id}`);
  const goToProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user?.username) router.push(`/${user.username}`);
  };

  return (
    <article 
        onClick={goToPost}
        className="flex gap-4 px-4 pt-4 cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors relative"
    >
      <div className="flex flex-col items-center flex-shrink-0 w-11">
          <div 
             onClick={goToProfile}
             className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden border border-border-color z-10 relative"
          >
              <img 
                src={getAvatarUrl(user?.avatarUrl)} 
                alt={user?.username || 'User'} 
                className="w-full h-full object-cover"
                // 👇 ESTA ES LA SOLUCIÓN: Si falla, carga la default
                onError={(e) => {
                    e.currentTarget.src = '/assets/default_profile_400x400.png';
                }}
              />
          </div>
          
          {!isLast && (
              <div className="w-[2px] flex-1 bg-gray-200 dark:bg-gray-800 my-2 rounded-full"></div>
          )}
      </div>

      <div className="flex-1 min-w-0 pb-4 border-b border-border-color/60">
          {repostFromUserName && (
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1 -ml-1">
              <Repeat2 size={12} />
              <span>{repostFromUserName} reposteó</span>
            </div>
          )}

          <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 truncate">
                  <span onClick={goToProfile} className="font-bold text-[15px] hover:underline cursor-pointer truncate">
                      {user?.username}
                  </span>
                  <span className="text-gray-400 text-sm flex-shrink-0">
                      {formatTime(createdAt)}
                  </span>
              </div>
              
              <div className="flex items-center gap-1 -mr-2">
                  {currentUser?.username === user?.username && (
                      <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors">
                          <Trash2 size={18} />
                      </button>
                  )}
                  <button className="p-2 text-gray-400 hover:text-foreground rounded-full transition-colors">
                      <MoreHorizontal size={20} />
                  </button>
              </div>
          </div>

          <p className="text-[15px] leading-relaxed mt-0.5 whitespace-pre-wrap break-words text-foreground">
              {content}
          </p>

          {imageUrl && (
              <div className="mt-3 rounded-xl overflow-hidden border border-border-color/50 max-h-[500px]">
                  <img 
                      src={getFullUrl(imageUrl)} 
                      alt="Post content" 
                      className="w-full h-auto object-cover" 
                      loading="lazy"
                  />
              </div>
          )}

          <div className="flex items-center gap-4 mt-3">
              <button onClick={handleLike} className="group flex items-center gap-1.5" title="Me gusta">
                  <Heart size={22} className={`transition-colors duration-200 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500 group-hover:text-red-500'}`} strokeWidth={1.5}/>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setIsReplyModalOpen(true); }} className="group flex items-center gap-1.5" title="Responder">
                  <MessageCircle size={22} className="text-gray-500 group-hover:text-foreground transition-colors" strokeWidth={1.5}/>
              </button>
              <button className="group flex items-center gap-1.5" title="Repostear">
                  <Repeat2 size={22} className="text-gray-500 group-hover:text-green-500 transition-colors" strokeWidth={1.5}/>
              </button>
              <button className="group flex items-center gap-1.5" title="Compartir">
                  <Send size={22} className="text-gray-500 group-hover:text-blue-500 transition-colors" strokeWidth={1.5}/>
              </button>
          </div>

          {(likes > 0 || repliesCount > 0) && (
              <div className="flex items-center gap-2 mt-3 text-[14px] text-gray-500 font-normal">
                  {repliesCount > 0 && <span>{repliesCount} respuestas</span>}
                  {repliesCount > 0 && likes > 0 && <span className="text-gray-300">•</span>}
                  {likes > 0 && <span>{likes} me gusta</span>}
              </div>
          )}
      </div>

      {isReplyModalOpen && (
        <CreatePostModal 
            onClose={() => setIsReplyModalOpen(false)} 
            parentId={id}
            onPost={() => {
                setIsReplyModalOpen(false);
                if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('postCreatedGlobal'));
            }}
        />
      )}
    </article>
  );
};