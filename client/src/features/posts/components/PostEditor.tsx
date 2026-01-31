"use client";

import React, { useState, useRef } from 'react';
import { Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { getAvatarUrl } from '@/lib/utils';

// 1. CAMBIO AQUÍ: Agregamos className opcional a la interfaz
interface PostEditorProps {
  onPostCreated?: () => void;
  className?: string; 
}

// 2. CAMBIO AQUÍ: Recibimos className en los props (con valor por defecto '')
export const PostEditor = ({ onPostCreated, className = '' }: PostEditorProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !selectedFile) || !user) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('username', user.username);
      formData.append('content', content);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setContent('');
      removeImage();
      
      if (onPostCreated) onPostCreated();

    } catch (error) {
      console.error("Error creando post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  // 3. CAMBIO AQUÍ: Inyectamos la variable className en el formulario
  return (
    <form onSubmit={handleSubmit} className={`flex gap-4 w-full ${className}`}>
      <div className="flex-shrink-0 pt-1">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200 dark:border-gray-700">
           <img 
             src={getAvatarUrl(user.avatarUrl)} 
             alt={user.username} 
             className="w-full h-full object-cover"
             onError={(e) => {
                 e.currentTarget.src = '/assets/default_profile_400x400.png';
             }}
            />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <span className="font-semibold text-[15px] mb-1">{user.username}</span>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="¿Qué hay de nuevo?"
          className="w-full bg-transparent border-none outline-none resize-none text-[15px] placeholder-gray-500 min-h-[40px] text-foreground"
          rows={Math.max(2, content.split('\n').length)}
        />

        {preview && (
          <div className="relative mt-3 mb-2 w-full max-w-sm">
            <img src={preview} alt="Preview" className="rounded-xl border border-gray-200 dark:border-gray-800 object-cover max-h-[300px]" />
            <button 
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mt-2">
          <div className="text-gray-400">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <ImageIcon size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileSelect}
            />
          </div>

          <button
            type="submit"
            disabled={(!content.trim() && !selectedFile) || isSubmitting}
            className="px-4 py-1.5 bg-foreground text-background font-bold text-sm rounded-3xl disabled:opacity-30 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            Publicar
          </button>
        </div>
      </div>
    </form>
  );
};