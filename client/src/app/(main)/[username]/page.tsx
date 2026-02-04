"use client";

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, MoreHorizontal, LogOut } from 'lucide-react'; 
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { PostCard } from '@/features/posts/components/PostCard';
import { EditProfileModal } from '@/features/profile/components/EditProfileModal';
import { getAvatarUrl } from '@/lib/utils';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, logout } = useAuth();
  
  const rawUsername = params?.username;
  const profileUsername = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername;
  
  const TABS = ['Threads', 'Replies', 'Media', 'Reposts'];
  const [activeTab, setActiveTab] = useState('Threads');

  const [posts, setPosts] = useState<any[]>([]);
  const [viewedUser, setViewedUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.username === decodeURIComponent(profileUsername || '');

  // --- LOGICA DE CARGA (Intacta) ---
  const fetchUserData = useCallback(async () => {
    if (!profileUsername) return;
    try {
      const userRes = await api.get(`/users/search?q=${profileUsername}`);
      const found = userRes.data.find((u: any) => u.username === profileUsername);

      if (found) {
        setViewedUser(found);
        const status = found.followers?.some((f: any) => f.username === currentUser?.username);
        setIsFollowing(!!status);
      }
    } catch (error) {
      console.error("Error cargando perfil:", error);
    } finally {
      setLoading(false);
    }
  }, [profileUsername, currentUser]);

  const fetchTabContent = useCallback(async () => {
    if (!profileUsername) return;
    try {
      let endpoint = '';
      switch (activeTab) {
        case 'Threads': endpoint = `/posts/user/${profileUsername}/threads`; break;
        case 'Replies': endpoint = `/posts/user/${profileUsername}/replies`; break;
        case 'Reposts': endpoint = `/posts/user/${profileUsername}/reposts`; break;
        case 'Media': endpoint = `/posts/user/${profileUsername}/threads`; break;
        default: endpoint = `/posts/user/${profileUsername}/threads`;
      }
      
      const response = await api.get(endpoint);
      if (activeTab === 'Media') {
          const mediaPosts = response.data.filter((p: any) => p.imageUrl && p.imageUrl.trim() !== '');
          setPosts(mediaPosts);
      } else {
          setPosts(response.data);
      }
    } catch (error) {
      console.error(`Error en tab ${activeTab}`, error);
      setPosts([]);
    }
  }, [profileUsername, activeTab]);

  useEffect(() => { fetchUserData(); }, [fetchUserData]);
  useEffect(() => { fetchTabContent(); }, [fetchTabContent]);

  const handleFollow = async () => {
    if (!currentUser || isOwnProfile) return;
    // Optimistic Update
    const prev = isFollowing;
    setIsFollowing(!isFollowing); 
    try {
      await api.post(`/users/${profileUsername}/follow?followerUsername=${currentUser.username}`);
      fetchUserData(); 
    } catch (error) {
      setIsFollowing(prev);
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-500">Cargando perfil...</div>;
  if (!viewedUser && !loading) return <div className="p-20 text-center text-gray-500">Usuario no encontrado</div>;

  return (
    <div className="w-full min-h-screen pb-20 relative">
      
      {/* 1. HEADER GLOBAL STICKY */}
      <header className="sticky top-0 z-50 w-full border-b border-border-color bg-background/85 backdrop-blur-xl">
         <div className="flex justify-between items-center h-[50px] px-4 max-w-3xl mx-auto">
             {/* Botón Atras (opcional, o espacio vacío para centrar el título) */}
             <div className="w-8">
                 {!isOwnProfile && (
                     <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                         <ArrowLeft size={20} />
                     </button>
                 )}
             </div>
             
             {/* Título Central */}
             <span className="font-bold text-[17px]">
                 {isOwnProfile ? 'Perfil' : viewedUser?.username}
             </span>

             {/* Botón Derecho (Logout o Menú) */}
             <div className="w-8 flex justify-end">
                {isOwnProfile && (
                    <button onClick={logout} title="Cerrar sesión" className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                        <LogOut size={20} />
                    </button>
                )}
             </div>
         </div>
      </header>

      {/* 2. CONTENEDOR "CARD" PRINCIPAL */}
      <div className="mt-4 mx-0 md:mx-2 rounded-3xl overflow-hidden bg-[var(--feed-bg)] border border-border-color/20 relative z-0 shadow-sm min-h-[calc(100vh-100px)]">
        
        {/* Contenido del Perfil dentro de la Card */}
        <div className="pt-6 md:pt-8 px-6 md:px-8">
            
            {/* INFO USUARIO (Layout Flex: Texto Izq / Avatar Der) */}
            <div className="flex justify-between items-start gap-4 mb-6">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold leading-tight mb-1">
                        {viewedUser?.displayName || profileUsername}
                    </h1>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-[16px]">{profileUsername}</span>
                        <span className="bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">
                            threads.net
                        </span>
                    </div>
                    <div className="text-[15px] whitespace-pre-wrap leading-relaxed mb-4">
                        {viewedUser?.bio || "Sin biografía."}
                    </div>
                    <div className="text-gray-500 text-[15px]">
                        <span className="text-foreground font-semibold">{viewedUser?.followers?.length || 0}</span> followers
                    </div>
                </div>

                <div className="flex-shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-border-color bg-gray-200">
                          <img 
                              src={getAvatarUrl(viewedUser.avatarUrl)} 
                              alt={profileUsername} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                 e.currentTarget.src = '/assets/default_profile_400x400.png';
                              }}
                          />
                    </div>
                </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="mb-2">
                {isOwnProfile ? (
                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="w-full border border-border-color rounded-xl py-1.5 font-bold text-[15px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        Edit profile
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button 
                            onClick={handleFollow}
                            className={`flex-1 border rounded-xl py-1.5 font-bold text-[15px] transition-colors ${
                                isFollowing 
                                    ? 'border-border-color text-gray-500 hover:text-red-500' 
                                    : 'bg-foreground text-background border-transparent hover:opacity-90'
                            }`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                        <button 
                              onClick={() => router.push(`/messages/${profileUsername}`)}
                              className="flex-1 border border-border-color rounded-xl py-1.5 font-bold text-[15px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            Message
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* TABS (Sticky dentro de la Card) */}
        <div className="sticky top-0 z-10 bg-[var(--feed-bg)] pt-2 border-b border-border-color/10">
            <div className="flex px-4">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-[15px] font-semibold text-center transition-colors relative ${
                        activeTab === tab 
                            ? 'text-foreground' 
                            : 'text-gray-500 hover:text-gray-400'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-foreground rounded-full"></div>
                    )}
                  </button>
                ))}
            </div>
        </div>

        {/* LISTA DE POSTS */}
        <div className="min-h-[200px]">
            {posts.length > 0 ? (
                posts.map((post) => (
                    <div key={post.id} className="border-b border-border-color/10 last:border-0">
                         <PostCard {...post} />
                    </div>
                ))
            ) : (
                <div className="py-16 text-center text-gray-500 text-[15px]">
                    {activeTab === 'Media' 
                        ? "No photos or videos yet." 
                        : "No posts yet."}
                </div>
            )}
        </div>

      </div>

      {/* MODAL (Fuera del flujo) */}
      {isEditModalOpen && (
        <EditProfileModal 
          user={viewedUser} 
          onClose={() => setIsEditModalOpen(false)} 
          onUpdate={fetchUserData} 
        />
      )}
    </div>
  );
}