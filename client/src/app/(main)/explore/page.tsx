"use client";

import { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import api from '@/lib/api';
// 👇 IMPORTANTE: Importamos el componente inteligente que creaste
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

    // Debounce de 300ms para no saturar el servidor
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="w-full max-w-[620px] mx-auto min-h-screen pb-20">
      
      {/* 1. TÍTULO Y BARRA DE BÚSQUEDA */}
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-3xl font-bold mb-4">Buscar</h1>
        
        <div className="relative group">
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <SearchIcon size={20} />
           </div>
           <input
             type="text"
             placeholder="Buscar"
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             className="w-full bg-gray-100 dark:bg-[#1e1e1e] text-foreground rounded-2xl pl-12 pr-4 py-3.5 outline-none border border-transparent focus:border-gray-300 dark:focus:border-gray-700 transition-all placeholder-gray-500"
             autoFocus
           />
        </div>
      </div>

      {/* 2. LISTA DE RESULTADOS */}
      <div className="mt-2">
        {results.length > 0 ? (
          results.map((user) => (
            // 👇 AQUÍ ESTÁ LA MAGIA:
            // Usamos el componente que sabe verificar si ya lo sigues
            <UserResultCard key={user.id} user={user} />
          ))
        ) : (
          /* Estado Vacío o Sin Resultados */
          <div className="p-8 text-center">
             {query.trim().length > 0 ? (
                <p className="text-gray-500">No se encontraron resultados para "{query}"</p>
             ) : (
                <div className="mt-10 opacity-40 flex flex-col items-center">
                    <SearchIcon size={48} className="mb-4" />
                    <p>Busca personas, temas o etiquetas.</p>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}