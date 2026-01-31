"use client";

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center font-sans">
      
      {/* CORRECCIÓN IMPORTANTE: 
          Quitamos el div con "hidden sm:block". 
          Ahora Sidebar se renderiza siempre y él mismo gestiona el responsive. 
      */}
      <Sidebar />

      {/* CONTENIDO CENTRAL (FEED) 
          - pb-20: Espacio abajo para que la barra móvil no tape el último post.
          - md:ml-[80px]: Margen a la izquierda solo en PC (donde está la barra lateral).
          - En móvil (default) no hay margen izquierdo porque la barra está abajo.
      */}
      <main className="w-full max-w-[700px] py-8 px-0 sm:px-4 md:ml-[80px] pb-24">
        {children}
      </main>

    </div>
  );
}