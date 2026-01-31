"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { PostCard } from '@/features/posts/components/PostCard';
import { CreatePostModal } from '@/features/posts/components/CreatePostModal';

export default function PostPage() {
  const { id } = useParams(); // Obtenemos el ID del post de la URL
  const router = useRouter();
  
  const [post, setPost] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Para responder
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  // Cargar Post y Respuestas
  useEffect(() => {
    const fetchPostData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // 1. Cargar el post principal
        const postRes = await api.get(`/posts/${id}`);
        setPost(postRes.data);

        // 2. Cargar las respuestas (asumiendo que tienes este endpoint o usas threads)
        // Si tu backend no tiene endpoint de replies directo, intenta cargar el hilo
        try {
            const repliesRes = await api.get(`/posts/${id}/replies`); 
            setReplies(repliesRes.data);
        } catch (err) {
            console.log("No hay respuestas o error cargándolas");
            setReplies([]);
        }

      } catch (error) {
        console.error("Error cargando post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [id]);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-gray-400" />
        </div>
    );
  }

  if (!post) {
    return <div className="p-10 text-center text-gray-500">Post no encontrado</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      
      {/* Header simple con botón volver */}
      <div className="flex items-center gap-4 px-4 py-3 sticky top-0 bg-background/90 backdrop-blur z-30 border-b border-border-color/50">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={20} />
        </button>
        <span className="font-bold text-lg">Hilo</span>
      </div>

      {/* POST PRINCIPAL */}
      <div className="border-b border-border-color">
         <PostCard {...post} />
      </div>

      {/* SECCIÓN DE RESPUESTAS */}
      <div className="pb-40">
         {replies.length > 0 && (
             <div className="px-4 py-3 text-sm text-gray-500 font-medium">Respuestas</div>
         )}
         
         {replies.map((reply) => (
             <PostCard key={reply.id} {...reply} />
         ))}

         {replies.length === 0 && (
            <div className="py-10 text-center text-gray-400 text-sm">
                Nadie ha respondido aún. <br/>
                <button 
                    onClick={() => setIsReplyModalOpen(true)}
                    className="text-sky-500 hover:underline mt-2"
                >
                    Sé el primero en responder
                </button>
            </div>
         )}
      </div>

      {/* Modal para responder si se abre desde aquí */}
      {isReplyModalOpen && (
        <CreatePostModal 
            parentId={post.id}
            onClose={() => setIsReplyModalOpen(false)}
            onPost={() => window.location.reload()} // Recarga simple para ver la respuesta
        />
      )}

    </div>
  );
}