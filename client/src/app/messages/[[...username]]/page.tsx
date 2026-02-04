"use client";

import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import { ImageIcon, Send, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation'; // 👈 Hooks de Next.js
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

// Utilidad para URLs
const getFullImageUrl = (path: string) => {
  if (!path) return '';
  return path.startsWith('http') ? path : `https://socialnetworkserver-3kyu.onrender.com${path}`;
};

export default function MessagesPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  
  // En Next.js, los params opcionales [[...username]] vienen como array
  const urlUsername = params?.username ? params.username[0] : null;

  const scrollRef = useRef<HTMLDivElement>(null);

  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // --- 1. CARGA DE CONTACTOS ---
  const fetchContactsData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const resContacts = await api.get(`/messages/contacts/${currentUser.username}`);
      setContacts(resContacts.data);
      
      const resCounts = await api.get(`/messages/unread-counts/${currentUser.username}`);
      setUnreadCounts(resCounts.data);
    } catch (err) { 
      console.error("Error cargando contactos:", err); 
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // --- 2. CARGA DE CHAT ---
  const fetchChat = useCallback(async () => {
    if (!urlUsername || !currentUser) return;
    try {
      const res = await api.get(`/messages/conversation?user1=${currentUser.username}&user2=${urlUsername}`);
      setMessages(res.data);
      // Marcar como leído
      await api.patch(`/messages/read?username=${currentUser.username}&from=${urlUsername}`);
    } catch (e) { 
      console.error("Error cargando chat:", e); 
    }
  }, [urlUsername, currentUser]);

  // --- EFECTOS (Polling) ---
  useEffect(() => {
    fetchContactsData();
    const interval = setInterval(fetchContactsData, 5000); 
    return () => clearInterval(interval);
  }, [fetchContactsData]);

  useEffect(() => {
    if (urlUsername && currentUser) {
      fetchChat();
      const interval = setInterval(fetchChat, 3000); // Polling rápido para chat activo
      return () => clearInterval(interval);
    }
  }, [fetchChat, urlUsername, currentUser]);

  // Auto-scroll al fondo
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // --- ENVIAR MENSAJE ---
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || !urlUsername || !currentUser) return;

    setNewMessage(''); // Limpieza inmediata
    try {
      await api.post(`/messages/send?from=${currentUser.username}&to=${urlUsername}`, 
        content, { headers: { 'Content-Type': 'text/plain' } });
      
      fetchChat();
      fetchContactsData();
    } catch (e) { 
      console.error("Error enviando mensaje:", e);
      setNewMessage(content); // Restaurar si falla
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex h-[calc(100vh-0px)] md:h-screen w-full bg-background text-foreground overflow-hidden">
      
      {/* --- COLUMNA IZQUIERDA: LISTA DE CONTACTOS --- 
          En móvil: Se oculta si hay un chat abierto (urlUsername existe).
          En desktop: Siempre visible (w-1/3).
      */}
      <div className={`w-full md:w-[350px] border-r border-border-color flex flex-col ${urlUsername ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header Sidebar */}
        <div className="p-4 border-b border-border-color flex justify-between items-center h-[74px]">
          <h2 className="text-xl font-bold">Mensajes</h2>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
            <MoreHorizontal size={24} />
          </button>
        </div>

        {/* Lista de Contactos */}
        <div className="flex-1 overflow-y-auto">
          {loading && contacts.length === 0 ? (
             <div className="p-5 text-center text-gray-500">Cargando...</div>
          ) : contacts.length === 0 ? (
             <div className="p-5 text-center text-gray-500 text-sm">
                No tienes mensajes aún. <br/> Busca un perfil y envíale un mensaje.
             </div>
          ) : (
            contacts.map((contact) => (
                <div 
                  key={contact.username} 
                  onClick={() => router.push(`/messages/${contact.username}`)}
                  className={`flex items-center gap-4 p-4 cursor-pointer transition-colors border-b border-border-color/30 hover:bg-gray-50 dark:hover:bg-white/5 ${
                    urlUsername === contact.username ? 'bg-gray-100 dark:bg-white/10 border-l-4 border-l-foreground' : ''
                  }`}
                >
                  {/* Avatar + Badge */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-border-color">
                        {contact.avatarUrl ? (
                            <img src={getFullImageUrl(contact.avatarUrl)} className="w-full h-full object-cover" alt="avatar"/>
                        ) : (
                            <span className="font-bold text-lg">{contact.username[0].toUpperCase()}</span>
                        )}
                    </div>
                    {/* Badge de No Leídos */}
                    {unreadCounts[contact.username] > 0 && urlUsername !== contact.username && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-background">
                            {unreadCounts[contact.username]}
                        </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">
                        {contact.displayName || contact.username}
                    </div>
                    <div className={`text-sm truncate ${unreadCounts[contact.username] > 0 ? 'font-bold text-foreground' : 'text-gray-500'}`}>
                        {unreadCounts[contact.username] > 0 ? 'Nuevos mensajes' : 'Ver conversación'}
                    </div>
                  </div>
                </div>
            ))
          )}
        </div>
      </div>


      {/* --- COLUMNA DERECHA: CHAT --- 
          En móvil: Solo visible si hay chat abierto.
          En desktop: Siempre visible (flex-1).
      */}
      <div className={`flex-1 flex flex-col bg-background relative ${!urlUsername ? 'hidden md:flex' : 'flex'}`}>
        
        {urlUsername ? (
          <>
            {/* Header del Chat */}
            <div className="flex items-center gap-3 p-3 border-b border-border-color h-[74px] bg-background/95 backdrop-blur z-10">
              <button 
                onClick={() => router.push('/messages')} 
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full"
              >
                <ArrowLeft size={24} />
              </button>
              
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    <span className="font-bold">{urlUsername[0].toUpperCase()}</span>
                 </div>
                 <div>
                    <h3 className="font-bold leading-none">{urlUsername}</h3>
                    <span className="text-xs text-gray-500">En línea</span>
                 </div>
              </div>
            </div>

            {/* Lista de Mensajes */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {messages.map((m) => {
                 const isMine = m.sender.username === currentUser.username;
                 return (
                    <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-[15px] break-words shadow-sm ${
                            isMine 
                             ? 'bg-gray-600 text-white rounded-tr-sm' 
                             : 'bg-gray-200 dark:bg-[#1e1e1e] text-foreground rounded-tl-sm'
                        }`}>
                            {m.content}
                            
                            {/* POST COMPARTIDO */}
                            {m.sharedPost && (
                                <div 
                                  onClick={() => router.push(`/post/${m.sharedPost.id}`)}
                                  className="mt-2 p-2 rounded-lg bg-black/10 dark:bg-white/10 cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-5 h-5 rounded-full bg-gray-400 overflow-hidden">
                                           {/* Avatar mini */}
                                        </div>
                                        <span className="text-xs font-bold opacity-80">@{m.sharedPost.user?.username}</span>
                                    </div>
                                    <p className="text-xs line-clamp-2 italic opacity-90">{m.sharedPost.content}</p>
                                    {m.sharedPost.imageUrl && (
                                        <div className="mt-1 rounded overflow-hidden h-24 w-full">
                                            <img src={getFullImageUrl(m.sharedPost.imageUrl)} className="w-full h-full object-cover" alt="shared"/>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                 );
              })}
            </div>

            {/* Input de Mensaje */}
            <div className="p-3 border-t border-border-color bg-background">
               <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-gray-100 dark:bg-[#1e1e1e] rounded-3xl px-2 py-1.5 border border-transparent focus-within:border-gray-400 transition-colors">
                  <button type="button" className="p-2 text-gray-500 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                     <ImageIcon size={22} />
                  </button>
                  
                  <input 
                    className="flex-1 bg-transparent border-none outline-none text-[15px] placeholder-gray-500 text-foreground px-1"
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />

                  {newMessage.trim() && (
                      <button type="submit" className="p-2 text-gray-500 font-bold hover:bg-blue-500/10 rounded-full transition-colors">
                         <span className="text-sm">Enviar</span>
                      </button>
                  )}
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
             <div className="w-20 h-20 border-2 border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center mb-4">
                <Send size={32} />
             </div>
             <h3 className="text-lg font-semibold mb-1">Tus mensajes</h3>
             <p className="text-sm">Envía fotos y mensajes privados a tus amigos.</p>
          </div>
        )}
      </div>

    </div>
  );
}