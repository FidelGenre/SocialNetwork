"use client";

import React from 'react';
import { X } from 'lucide-react';
import { PostEditor } from './PostEditor';

interface CreatePostModalProps {
  onClose: () => void;
  onPost?: () => void;
  parentId?: string;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPost, parentId }) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-sm pt-20 px-4 animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      {/* CAMBIO: bg-background, border-border-color y text-foreground */}
      <div className="bg-background border border-border-color w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Header del Modal */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-color">
            <button 
                onClick={onClose} 
                className="p-2 -ml-2 rounded-full text-foreground hover:bg-hover-bg transition-colors"
            >
                <X size={20} />
            </button>
            
            <div className="font-bold text-foreground">Nuevo hilo</div>
            <div className="w-8"></div> 
        </div>

        <div className="p-0">
            <PostEditor 
                onPostCreated={() => {
                    if(onPost) onPost();
                    onClose();
                }} 
                className="border-none bg-transparent" // Aseguramos que sea transparente
            />
        </div>
      </div>
    </div>
  );
};