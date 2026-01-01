import { useState, useEffect, useRef, FormEvent } from 'react'; // Se eliminó 'React' y se agregó 'FormEvent'
import { ImageIcon, Send } from 'lucide-react';
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

  const BASE_URL = 'http://localhost:8080';

  const getFullImageUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${BASE_URL}${path}`;
  };

  // Carga de contactos y notificaciones
  useEffect(() => {
    if (currentUser) {
      const fetchData = async () => {
        try {
          const resContacts = await api.get(`/messages/contacts/${currentUser.username}`);
          setContacts(resContacts.data);
          const resCounts = await api.get(`/messages/unread-counts/${currentUser.username}`);
          setUnreadCounts(resCounts.data);
        } catch (err) { console.error(err); }
      };
      fetchData();
      const interval = setInterval(fetchData, 5000); 
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Carga de la conversación activa
  useEffect(() => {
    if (urlUsername && currentUser) {
      const fetchChat = async () => {
        try {
          const res = await api.get(`/messages/conversation?user1=${currentUser.username}&user2=${urlUsername}`);
          setMessages(res.data);
          await api.patch(`/messages/read?username=${currentUser.username}&from=${urlUsername}`);
        } catch (e) { console.error(e); }
      };
      fetchChat();
      const interval = setInterval(fetchChat, 4000);
      return () => clearInterval(interval);
    }
  }, [urlUsername, currentUser]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Se usa FormEvent directamente en lugar de React.FormEvent
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !urlUsername || !currentUser) return;
    try {
      await api.post(`/messages/send?from=${currentUser.username}&to=${urlUsername}`, 
        newMessage.trim(), { headers: { 'Content-Type': 'text/plain' } });
      setNewMessage('');
      const res = await api.get(`/messages/conversation?user1=${currentUser.username}&user2=${urlUsername}`);
      setMessages(res.data);
    } catch (e) { console.error(e); }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Chat</h2>
        </div>
        <div className={styles.contactList}>
          {contacts.map((contact) => (
            <div 
              key={contact.username} 
              className={`${styles.contactItem} ${urlUsername === contact.username ? styles.activeContact : ''}`} 
              onClick={() => navigate(`/messages/${contact.username}`)}
            >
              <div className={styles.avatarContainer}>
                <div className={styles.avatarPlaceholder}>
                  {(contact.displayName || contact.username)[0].toUpperCase()}
                </div>
                {unreadCounts[contact.username] > 0 && urlUsername !== contact.username && (
                  <div className={styles.unreadBadge}>{unreadCounts[contact.username]}</div>
                )}
              </div>
              <div className={styles.contactInfo}>
                <span className={styles.contactName}>{contact.displayName || contact.username}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.chatArea}>
        {urlUsername ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.headerInfo}>
                <span className={styles.headerName}>{urlUsername}</span>
                <span className={styles.headerStatus}>En línea</span>
              </div>
            </div>

            <div className={styles.messageList} ref={scrollRef}>
              {messages.map(m => (
                <div key={m.id} className={`${styles.messageRow} ${m.sender.username === currentUser?.username ? styles.myMessageRow : styles.theirMessageRow}`}>
                  <div className={`${styles.messageBubble} ${m.sender.username === currentUser?.username ? styles.myBubble : styles.theirBubble}`}>
                    <div className={styles.msgContent}>{m.content}</div>

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
          <div className={styles.emptyState}><p>Selecciona un chat.</p></div>
        )}
      </div>
    </div>
  );
};

export default Messages;