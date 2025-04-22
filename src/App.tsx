import React, { useState, useEffect } from "react";
import AlbumList from "./components/AlbumList";
import MusicPlayer from "./components/MusicPlayer";
import { Album, Song } from "./types/types"; // Importar los tipos

const App: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlbumSongs, setSelectedAlbumSongs] = useState<Song[] | null>(null);
  const [selectedAlbumTitle, setSelectedAlbumTitle] = useState<string | null>(null);

  const fetchSongs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://musica.gmtdev.duckdns.org/api/music");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawSongs = await response.json();
      console.log('rawSongs:', rawSongs);

      // Verificar que 'tracks' sea un array
      if (!Array.isArray(rawSongs.tracks)) {
        throw new Error("La propiedad 'tracks' no es un array");
      }

      const albumsMap = new Map<string, Album>();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rawSongs.tracks.forEach((raw: any, index: number) => {
        const albumKey = `${raw.album}-${raw.artist}`;

        if (!albumsMap.has(albumKey)) {
          albumsMap.set(albumKey, {
            id: albumKey,
            album: raw.album,
            artist: raw.artist,
            cover_url: raw.cover ? `data:image/jpeg;base64,${raw.cover}` : undefined,
            songs: [],
          });
        }

        // Asegúrate de que 'url' esté presente y agregue el valor correspondiente
        albumsMap.get(albumKey)!.songs.push({
          id: index.toString(),
          title: raw.title,
          file: raw.filePath,  // Verifica que este campo sea correcto
          album: raw.album,
          artist: raw.artist,
          cover_url: raw.cover ? `data:image/jpeg;base64,${raw.cover}` : undefined,
          url: raw.url, // Aquí es donde agregamos 'url'
        });
      });

      setAlbums(Array.from(albumsMap.values()));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbumSongs(album.songs);
    setSelectedAlbumTitle(album.album);
  };

  const handleCloseAlbumSongs = () => {
    setSelectedAlbumSongs(null);
    setSelectedAlbumTitle(null);
  };

  if (loading) return <div>Cargando álbumes...</div>;
  if (error) return <div>Error al cargar los álbumes: {error}</div>;

  return (
    <div className="App">
      <h1>GMusic - Tu reproductor de música</h1>

      <AlbumList albums={albums} onAlbumClick={handleAlbumClick} />

      {selectedAlbumSongs && (
        <div style={{ marginTop: "20px", border: "1px solid #eee", padding: "15px" }}>
          <h2>Canciones de {selectedAlbumTitle}</h2>
          <ul>
            {selectedAlbumSongs.map((song) => (
              <li key={song.id} style={{ cursor: "pointer" }} onClick={() => setCurrentSong(song)}>
                {song.title}
              </li>
            ))}
          </ul>
          <button onClick={handleCloseAlbumSongs}>Cerrar</button>
        </div>
      )}

      <MusicPlayer song={currentSong} />
    </div>
  );
};

export default App;
