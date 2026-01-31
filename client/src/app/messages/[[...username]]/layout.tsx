"use client";

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      
      {/* 1. Agregamos la Sidebar manualmente aquí */}
      <Sidebar />

      {/* 2. CONTENIDO 
          Nota que NO tiene "max-w-[620px]" ni "items-center".
          Usa "w-full" para ocupar todo el espacio restante. 
      */}
      <main className="w-full md:ml-[80px]">
        {children}
      </main>

    </div>
  );
}