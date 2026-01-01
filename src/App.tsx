import React, { useState, useEffect } from "react";
import AlbumList from "./components/AlbumList";
import MusicPlayer from "./components/MusicPlayer";
import { Album, Song } from "./types/types";

const App: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentSongList, setCurrentSongList] = useState<Song[]>([]);

  const fetchSongs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://musica.gmtdev.duckdns.org/api/music"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawSongs = await response.json();
      console.log("rawSongs:", rawSongs);

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
            cover_url: raw.cover
              ? `data:image/jpeg;base64,${raw.cover}`
              : undefined,
            songs: [],
          });
        }

        albumsMap.get(albumKey)!.songs.push({
          id: index.toString(),
          title: raw.title,
          file: raw.filePath,
          album: raw.album,
          artist: raw.artist,
          cover_url: raw.cover
            ? `data:image/jpeg;base64,${raw.cover}`
            : undefined,
          url: raw.url,
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
    if (selectedAlbumId === album.id) {
      setSelectedAlbumId(null); // Si el álbum ya está seleccionado, lo deseleccionamos
    } else {
      setSelectedAlbumId(album.id); // Si no, lo seleccionamos
    }
  };
  const handleSongClick = (song: Song) => {
    const album = albums.find((a) => a.songs.some((s) => s.id === song.id));
    if (album) {
      setCurrentSongList(album.songs);
      const index = album.songs.findIndex((s) => s.id === song.id);
      setCurrentIndex(index);
      setCurrentSong(song);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (!(e.target as HTMLElement).closest(".album-container")) {
      setSelectedAlbumId(null); // Cierra el álbum si se hace clic fuera
    }
  };

  useEffect(() => {
    window.addEventListener("click", handleClickOutside as EventListener);
    return () => {
      window.removeEventListener("click", handleClickOutside as EventListener);
    };
  }, []);

  if (loading) return <div>Cargando álbumes...</div>;
  if (error) return <div>Error al cargar los álbumes: {error}</div>;
  const handleChangeSong = (index: number) => {
    const song = currentSongList[index];
    if (song) {
      setCurrentIndex(index);
      setCurrentSong(song);
    }
  };

  return (
    <div className="App">
      <h1>GMusic</h1>

      <AlbumList
        albums={albums}
        onAlbumClick={handleAlbumClick}
        selectedAlbumId={selectedAlbumId}
        onSongClick={handleSongClick}
      />

      <MusicPlayer
        song={currentSong}
        songs={currentSongList}
        currentIndex={currentIndex}
        onChangeSong={handleChangeSong}
      />
    </div>
  );
};

export default App;
