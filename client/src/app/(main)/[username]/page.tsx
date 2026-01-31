"use client";

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, MoreHorizontal } from 'lucide-react'; 
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { PostCard } from '@/features/posts/components/PostCard';
import { EditProfileModal } from '@/features/profile/components/EditProfileModal';
import { getAvatarUrl } from '@/lib/utils';

const getFullAvatarUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http') || url.startsWith('blob')) return url;
  return `https://socialnetworkserver-3kyu.onrender.com${url}`;
};

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
    try {
      setIsFollowing(!isFollowing); 
      await api.post(`/users/${profileUsername}/follow?followerUsername=${currentUser.username}`);
      fetchUserData(); 
    } catch (error) {
      setIsFollowing(!isFollowing);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Cargando...</div>;
  if (!viewedUser && !loading) return <div className="p-10 text-center text-gray-500">Usuario no encontrado</div>;

  return (
    <div className="text-foreground w-full max-w-2xl mx-auto">
      <header className="px-6 pt-8 pb-4">
        <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
                <h1 className="text-3xl font-bold leading-tight">
                    {viewedUser?.displayName || profileUsername}
                </h1>
                <div className="flex items-center gap-2 mt-1 mb-4">
                    <span className="text-[16px]">{profileUsername}</span>
                    <span className="bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">
                        threads.net
                    </span>
                </div>
                <div className="text-[15px] whitespace-pre-wrap leading-relaxed mb-4">
                    {viewedUser?.bio || "Sin biografía."}
                </div>
                <div className="text-gray-500 text-[15px] hover:underline cursor-pointer">
                    {viewedUser?.followers?.length || 0} followers
                </div>
            </div>

            <div className="flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-border-color bg-gray-200">
                      <img 
                          src={getAvatarUrl(viewedUser.avatarUrl)} 
                          alt={profileUsername} 
                          className="w-full h-full object-cover"
                          // 👇 AQUÍ TAMBIÉN
                          onError={(e) => {
                             e.currentTarget.src = '/assets/default_profile_400x400.png';
                          }}
                      />
                </div>
            </div>
        </div>

        <div className="mt-6">
            {isOwnProfile ? (
                <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full border border-border-color rounded-xl py-2 font-semibold text-[15px] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                    Edit profile
                </button>
            ) : (
                <div className="flex gap-3">
                    <button 
                        onClick={handleFollow}
                        className={`flex-1 border rounded-xl py-2 font-semibold text-[15px] transition-colors ${
                            isFollowing 
                                ? 'border-border-color text-gray-500' 
                                : 'bg-foreground text-background border-transparent'
                        }`}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button 
                         onClick={() => router.push(`/messages/${profileUsername}`)}
                         className="flex-1 border border-border-color rounded-xl py-2 font-semibold text-[15px] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        Message
                    </button>
                </div>
            )}
        </div>
      </header>

      <nav className="flex mt-2 border-b border-border-color sticky top-0 bg-background/95 backdrop-blur z-40">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-[15px] font-semibold text-center transition-colors relative ${
                activeTab === tab 
                    ? 'text-foreground' 
                    : 'text-gray-500 hover:text-foreground'
            }`}
          >
            {tab}
            {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-foreground"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="pb-32 min-h-screen">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} {...post} />)
        ) : (
          <div className="py-12 text-center text-gray-500 text-[15px]">
            {activeTab === 'Media' 
                ? "No photos or videos yet." 
                : "No posts yet."}
          </div>
        )}
      </div>

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