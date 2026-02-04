"use client";

import React, { useState } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getAvatarUrl } from '@/lib/utils';

// Interfaz para los datos del post al que respondemos
interface PostData {
  id: string;
  content: string;
  user?: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

interface CreatePostModalProps {
  onClose: () => void;
  onPost: () => void;
  parentId?: string;
  // Prop opcional para mostrar el contexto de la respuesta
  replyToPost?: PostData; 
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPost, parentId, replyToPost }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('username', user?.username || '');
      if (parentId) {
        formData.append('parentId', parentId);
      }

      await api.post('/posts', formData);
      setContent('');
      onPost();
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error al publicar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 1. EL FONDO NEGRO (Overlay)
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-sm pt-16 px-4 animate-in fade-in duration-200"
      onClick={(e) => {
        // Al hacer clic en el fondo oscuro, cerramos el modal
        e.stopPropagation();
        onClose();
      }}
    >
      {/* 2. EL MODAL EN SÍ */}
      <div 
        className="bg-black border border-gray-800 w-full max-w-lg rounded-2xl p-4 relative shadow-2xl animate-in zoom-in-95 duration-200"
        // 👇 IMPORTANTE: Detiene la propagación del clic para que no abra el post de fondo
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Botón Cerrar */}
        <button 
          onClick={onClose} 
          className="absolute top-4 left-4 text-white hover:bg-gray-900 p-2 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="flex justify-end mb-6">
           <span className="text-gray-500 font-bold text-sm">
             {replyToPost ? 'Responder' : 'Nuevo hilo'}
           </span>
        </div>

        <div className="flex flex-col gap-4">
            {/* --- SECCIÓN DEL POST ORIGINAL (SI ES RESPUESTA) --- */}
            {replyToPost && (
                <div className="flex gap-4 relative">
                    {/* Columna Izquierda: Avatar + Línea Conectora */}
                    <div className="flex flex-col items-center w-11 flex-shrink-0">
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-700">
                             <img 
                                src={getAvatarUrl(replyToPost.user?.avatarUrl)} 
                                alt={replyToPost.user?.username} 
                                className="w-full h-full object-cover"
                             />
                        </div>
                        {/* La línea vertical gris */}
                        <div className="w-0.5 bg-gray-700 flex-grow mt-2 min-h-[24px]"></div>
                    </div>

                    {/* Columna Derecha: Contenido del post original */}
                    <div className="flex-1 pb-1">
                        <div className="flex items-center gap-2 text-[15px]">
                            <span className="font-bold text-white">{replyToPost.user?.displayName || replyToPost.user?.username}</span>
                            <span className="text-gray-500">@{replyToPost.user?.username}</span>
                            <span className="text-gray-500">· {new Date(replyToPost.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-white text-[15px] mt-0.5 line-clamp-3">{replyToPost.content}</p>
                        <div className="mt-3 text-gray-500 text-[15px]">
                            Respondiendo a <span className="text-blue-500">@{replyToPost.user?.username}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SECCIÓN DE TU RESPUESTA --- */}
            <div className="flex gap-4">
                {/* Tu Avatar */}
                <div className="flex flex-col items-center w-11 flex-shrink-0">
                     <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-700">
                        <img 
                            src={getAvatarUrl(user?.avatarUrl)} 
                            alt="Tu" 
                            className="w-full h-full object-cover"
                        />
                     </div>
                </div>

                {/* Tu Input */}
                <div className="flex-1">
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={replyToPost ? "Postea tu respuesta" : "¿Qué está pasando?"}
                        className="w-full bg-transparent text-white text-xl placeholder-gray-500 border-none focus:ring-0 resize-none min-h-[120px] mt-2 p-0"
                        autoFocus
                    />
                    
                    <div className="border-t border-gray-800 mt-4 pt-3 flex justify-between items-center">
                        <button className="text-gray-500 p-2 hover:bg-blue-500/10 rounded-full transition-colors">
                            <ImageIcon size={20} />
                        </button>

                        <button 
                            onClick={handleSubmit}
                            disabled={!content.trim() || isLoading}
                            className="bg-white text-black px-4 py-1.5 rounded-full font-bold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                            {replyToPost ? 'Responder' : 'Postear'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};