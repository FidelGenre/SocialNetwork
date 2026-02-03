"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // 1. Lista de rutas públicas (donde NO exigimos login)
    const publicRoutes = ["/login", "/register"];

    // 2. Si la ruta actual es pública, no hacemos nada (dejamos pasar)
    if (publicRoutes.includes(pathname)) {
      return;
    }

    // 3. Si NO hay usuario y NO estamos en una ruta pública -> Mandar al Login
    // (Verificamos también localStorage por si el contexto tarda en cargar al recargar F5)
    const storedUser = localStorage.getItem("user"); // O como llames a tu clave en localStorage
    
    if (!user && !storedUser) {
      router.push("/login");
    }
  }, [user, pathname, router, mounted]);

  // Evitamos renderizar nada hasta que sepamos dónde estamos para evitar parpadeos
  if (!mounted) {
    return null; 
  }

  // Si no hay usuario y no es ruta pública, mostramos nada mientras redirige (o un spinner)
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
  if (!user && !storedUser && !["/login", "/register"].includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}