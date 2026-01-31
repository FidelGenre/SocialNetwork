// src/lib/utils.ts

// Esta función decide qué imagen mostrar
export const getAvatarUrl = (url: string | undefined | null) => {
  // 1. Si no hay URL, retornamos la imagen gris por defecto
  if (!url || url.trim() === '') {
    return '/assets/default_profile_400x400.png';
  }

  // 2. Si ya es una URL completa (ej: Google auth), la devolvemos tal cual
  if (url.startsWith('http') || url.startsWith('blob')) {
    return url;
  }

  // 3. Si es una ruta relativa del backend, le pegamos el dominio
  return `https://socialnetworkserver-3kyu.onrender.com${url}`;
};