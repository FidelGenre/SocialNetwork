// src/lib/utils.ts

export const getAvatarUrl = (url: string | undefined | null) => {
  // 1. Si no hay URL, retornamos la imagen gris por defecto
  if (!url || url.trim() === '') {
    return '/assets/default_profile_400x400.png';
  }

  // 2. Si ya es una URL completa (ej: Google auth), la devolvemos tal cual
  if (url.startsWith('http') || url.startsWith('blob')) {
    return url;
  }

  // 3. CAMBIO: Apuntamos a LOCALHOST para ver las fotos de tu PC
  return `http://localhost:8080${url}`;
};