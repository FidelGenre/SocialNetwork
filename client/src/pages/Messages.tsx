import { useState, useEffect, useRef, type FormEvent } from 'react';
import { ImageIcon, Send, ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import styles from './Messages.module.css';

export const Messages = () => {
  const { username: urlUsername } = useParams<{ username?: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [newMessage, setNewMessage] = useState('');

  // Cambiado para que apunte a tu servidor real en Render
  const BASE_URL = 'https://socialnetworkserver-3kyu.onrender.com';

  const getFullImageUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${BASE_URL}${path}`;
  };

  // 1. Carga de contactos y notificaciones
  useEffect(() => {
    if (currentUser) {
      const fetchData = async () => {
        try {
          const resContacts = await api.get(`/messages/contacts/${currentUser.username}`);
          setContacts(resContacts.data);
          const resCounts = await api.get(`/messages/unread-counts/${currentUser.username}`);
          setUnreadCounts(resCounts.data);
        } catch (err) { console.error("Error cargando contactos:", err); }
      };
      fetchData();
      const interval = setInterval(fetchData, 5000); 
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // 2. Carga de la conversación activa y marcado como leído
  useEffect(() => {
    if (urlUsername && currentUser) {
      const fetchChat = async () => {
        try {
          const res = await api.get(`/messages/conversation?user1=${currentUser.username}&user2=${urlUsername}`);
          setMessages(res.data);
          // Marca mensajes como leídos al entrar al chat
          await api.patch(`/messages/read?username=${currentUser.username}&from=${urlUsername}`);
        } catch (e) { console.error("Error cargando chat:", e); }
      };
      fetchChat();
      const interval = setInterval(fetchChat, 4000);
      return () => clearInterval(interval);
    } else {
      setMessages([]); // Limpiar mensajes si no hay usuario seleccionado
    }
  }, [urlUsername, currentUser]);

  // 3. Auto-scroll al fondo cuando hay nuevos mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !urlUsername || !currentUser) return;
    try {
      await api.post(`/messages/send?from=${currentUser.username}&to=${urlUsername}`, 
        newMessage.trim(), { headers: { 'Content-Type': 'text/plain' } });
      setNewMessage('');
      // Actualización inmediata del chat tras enviar
      const res = await api.get(`/messages/conversation?user1=${currentUser.username}&user2=${urlUsername}`);
      setMessages(res.data);
    } catch (e) { console.error("Error enviando mensaje:", e); }
  };

  return (
    /* Clase dinámica 'chatOpen' para controlar la visibilidad en móviles */
    <div className={`${styles.container} ${urlUsername ? styles.chatOpen : ''}`}>
      
      {/* SIDEBAR: Lista de chats */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Mensajes</h2>
        </div>
        <div className={styles.contactList}>
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <div 
                key={contact.username} 
                className={`${styles.contactItem} ${urlUsername === contact.username ? styles.activeContact : ''}`} 
                onClick={() => navigate(`/messages/${contact.username}`)}
              >
                <div className={styles.avatarContainer}>
                  <div className={styles.avatarPlaceholder}>
                    {(contact.displayName || contact.username)[0].toUpperCase()}
                  </div>
                  {/* Badge de mensajes no leídos */}
                  {unreadCounts[contact.username] > 0 && urlUsername !== contact.username && (
                    <div className={styles.unreadBadge}>{unreadCounts[contact.username]}</div>
                  )}
                </div>
                <div className={styles.contactInfo}>
                  <div className={styles.contactName}>{contact.displayName || contact.username}</div>
                  <div className={styles.lastMessage}>Haz clic para chatear</div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}><p>No tienes chats aún.</p></div>
          )}
        </div>
      </div>

      {/* CHAT AREA: Visualización del mensaje seleccionado */}
      <div className={styles.chatArea}>
        {urlUsername ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.headerLeft}>
                {/* Botón Volver: Solo visible en móvil vía CSS */}
                <button className={styles.backBtn} onClick={() => navigate('/messages')}>
                  <ChevronLeft size={24} />
                </button>
                <div className={styles.headerInfo}>
                  <span className={styles.headerName}>{urlUsername}</span>
                  <span className={styles.headerStatus}>En línea</span>
                </div>
              </div>
            </div>

            <div className={styles.messageList} ref={scrollRef}>
              {messages.map(m => (
                <div key={m.id} className={`${styles.messageRow} ${m.sender.username === currentUser?.username ? styles.myMessageRow : styles.theirMessageRow}`}>
                  <div className={`${styles.messageBubble} ${m.sender.username === currentUser?.username ? styles.myBubble : styles.theirBubble}`}>
                    <div className={styles.msgContent}>{m.content}</div>

                    {/* Renderizado de Post Compartido si existe */}
                    {m.sharedPost && (
                      <div className={styles.sharedPostCard} onClick={() => navigate(`/post/${m.sharedPost.id}`)}>
                        <div className={styles.previewHeader}>
                          <div className={styles.miniAvatar}>{(m.sharedPost.user.displayName || 'U')[0].toUpperCase()}</div>
                          <span className={styles.previewDisplayName}>{m.sharedPost.user.displayName}</span>
                          <span className={styles.previewUsername}>@{m.sharedPost.user.username}</span>
                        </div>
                        <p className={styles.previewText}>{m.sharedPost.content}</p>
                        {m.sharedPost.imageUrl && (
                          <div className={styles.previewImageContainer}>
                            <img src={getFullImageUrl(m.sharedPost.imageUrl)} className={styles.previewImage} alt="Shared" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form className={styles.inputArea} onSubmit={handleSendMessage}>
              <button type="button" className={styles.iconBtnInput}><ImageIcon size={20} /></button>
              <div className={styles.inputWrapper}>
                <input 
                  className={styles.messageInput} 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  placeholder="Escribe un mensaje..." 
                />
              </div>
              <button type="submit" className={styles.sendBtnIcon} disabled={!newMessage.trim()}>
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>Selecciona una conversación para empezar a chatear.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;