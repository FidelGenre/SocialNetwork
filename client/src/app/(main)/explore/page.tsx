"use client";

import { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import api from '@/lib/api';
import { UserResultCard } from '@/features/search/components/UserResultCard';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const performSearch = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }

      try {
        const response = await api.get(`/users/search?q=${query}`);
        setResults(response.data);
      } catch (error) {
        console.error("Error buscando usuarios:", error);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="w-full min-h-screen pb-20 relative">
      
      {/* 1. HEADER GLOBAL STICKY */}
      <header className="sticky top-0 z-50 w-full border-b border-border-color bg-background/85 backdrop-blur-xl">
         <div className="flex justify-center items-center h-[50px] px-4">
             <span className="font-bold text-[17px]">Buscar</span>
         </div>
      </header>

      {/* 2. CONTENEDOR "CARD" PRINCIPAL */}
      <div className="mt-4 mx-0 md:mx-2 rounded-3xl overflow-hidden bg-[var(--feed-bg)] border border-border-color/20 relative z-0 shadow-sm min-h-[calc(100vh-100px)]">
        
        {/* Padding interno de la tarjeta */}
        <div className="p-4">
            
            {/* BARRA DE BÚSQUEDA */}
            <div className="relative group mb-6">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <SearchIcon size={18} />
               </div>
               <input
                 type="text"
                 placeholder="Buscar"
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 className="w-full bg-gray-100 dark:bg-black/20 text-foreground rounded-2xl pl-11 pr-4 py-3 outline-none border border-transparent focus:border-gray-300 dark:focus:border-gray-600 transition-all placeholder-gray-500 font-medium"
                 autoFocus
               />
            </div>

            {/* LISTA DE RESULTADOS */}
            <div className="flex flex-col">
              {results.length > 0 ? (
                results.map((user) => (
                  <UserResultCard key={user.id} user={user} />
                ))
              ) : (
                /* Estado Vacío */
                <div className="py-12 text-center">
                    {query.trim().length > 0 ? (
                       <p className="text-gray-500">No se encontraron resultados.</p>
                    ) : (
                       <div className="opacity-40 flex flex-col items-center gap-4">
                           <div className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center">
                               <SearchIcon size={32} />
                           </div>
                           <p className="font-medium">Busca personas o amigos.</p>
                       </div>
                    )}
                </div>
              )}
            </div>

        </div>
      </div>
    </div>
  );
}