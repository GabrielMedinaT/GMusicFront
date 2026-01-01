// src/types/types.ts

export interface Song {
  id: string;

  // Metadatos
  title: string;
  artist: string;
  album: string;
  year?: number;

  // Archivo local (opcional pero muy útil)
  file?: File;

  // URL de reproducción (OBLIGATORIA)
  // → antes: URL del backend
  // → ahora: URL.createObjectURL(file)
  url: string;

  // Portada en base64 o blob
  cover_url?: string;
}

export interface Album {
  id: string;

  album: string;
  artist: string;

  cover_url?: string;

  // Canciones del álbum
  songs: Song[];
}
