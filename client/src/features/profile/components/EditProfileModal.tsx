"use client";

import React, { useState, useRef } from 'react';
import { X, Camera } from 'lucide-react';
import api from '@/lib/api'; // Ajusta la ruta de tu api

interface EditProfileModalProps {
  user: any;
  onClose: () => void;
  onUpdate: () => void;
}

export const EditProfileModal = ({ user, onClose, onUpdate }: EditProfileModalProps) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [bio, setBio] = useState(user.bio || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determinar URL de imagen (si es blob local o del servidor)
  const currentAvatar = user.avatarUrl && !preview
    ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `https://socialnetworkserver-3kyu.onrender.com${user.avatarUrl}`)
    : preview;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1. Actualizar Datos
      await api.put(`/users/${user.username}`, { displayName, bio });
      
      // 2. Actualizar Foto (si hubo cambio)
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        await api.patch(`/users/${user.username}/avatar`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      alert("Error al guardar los cambios.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-background border border-border-color w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-color">
             <span className="font-bold text-lg">Editar perfil</span>
             <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                <X size={20} />
             </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
           
           {/* Sección Foto + Datos */}
           <div className="flex items-start gap-6">
              
              {/* Foto Circular con Icono de Cámara */}
              <div 
                className="relative group cursor-pointer flex-shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-border-color bg-gray-200">
                      {currentAvatar ? (
                          <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover opacity-100 group-hover:opacity-70 transition-opacity" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-gray-500 bg-gray-200">
                              {displayName?.[0]?.toUpperCase() || 'U'}
                          </div>
                      )}
                  </div>
                  {/* Icono Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white drop-shadow-md" size={24} />
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              {/* Campos de Texto */}
              <div className="flex-1 flex flex-col gap-4">
                  <div>
                      <label className="block text-sm font-semibold mb-1">Nombre</label>
                      <input 
                        type="text" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-transparent border-b border-border-color py-1 focus:border-foreground outline-none transition-colors"
                        placeholder="Tu nombre"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-semibold mb-1">Biografía</label>
                      <textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-transparent border-b border-border-color py-1 focus:border-foreground outline-none resize-none transition-colors text-sm"
                        placeholder="Cuéntanos algo sobre ti..."
                        rows={2}
                      />
                  </div>
              </div>
           </div>

           {/* Botón Guardar */}
           <button 
             type="submit" 
             disabled={isLoading}
             className="w-full bg-foreground text-background font-bold py-3 rounded-xl mt-2 hover:opacity-90 transition-opacity disabled:opacity-50"
           >
             {isLoading ? 'Guardando...' : 'Listo'}
           </button>
        </form>

      </div>
    </div>
  );
};