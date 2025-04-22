export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  year?: number;
  file?: string;
  url: string; // <--- OBLIGATORIO
  cover_url?: string;
}



export interface Album {
  id: string; // Asegúrate de que 'id' esté presente
  album: string;
  artist: string;
  cover_url?: string;
  songs: Song[]; // 'songs' debe ser una propiedad obligatoria
}
