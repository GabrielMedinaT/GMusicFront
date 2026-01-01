import React, { useState } from "react";
import AlbumList from "./components/AlbumList";
import MusicPlayer from "./components/MusicPlayer";
import { Album, Song } from "./types/types";
import { parseBlob } from "music-metadata-browser";

const AUDIO_EXTENSIONS = ["mp3", "ogg", "wav", "flac"];
const COVER_NAMES = ["cover", "folder", "front", "album"];

const App: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSongList, setCurrentSongList] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────────
  // UTILIDADES
  // ─────────────────────────────────────────────
  const getAudioFilesRecursive = async (
    dir: FileSystemDirectoryHandle
  ): Promise<FileSystemFileHandle[]> => {
    const result: FileSystemFileHandle[] = [];

    for await (const entry of dir.values()) {
      if (entry.kind === "file") {
        const ext = entry.name.split(".").pop()?.toLowerCase();
        if (ext && AUDIO_EXTENSIONS.includes(ext)) {
          result.push(entry);
        }
      } else if (entry.kind === "directory") {
        const sub = await getAudioFilesRecursive(entry);
        result.push(...sub);
      }
    }

    return result;
  };

  const findCoverInFolder = async (
    dir: FileSystemDirectoryHandle
  ): Promise<string | undefined> => {
    for await (const entry of dir.values()) {
      if (entry.kind !== "file") continue;

      const name = entry.name.toLowerCase();
      const base = name.split(".")[0];
      const ext = name.split(".").pop();

      if (
        ext &&
        ["jpg", "jpeg", "png", "webp"].includes(ext) &&
        COVER_NAMES.includes(base)
      ) {
        const file = await entry.getFile();
        return URL.createObjectURL(file);
      }
    }
    return undefined;
  };

  // ─────────────────────────────────────────────
  // CARGA DE MÚSICA
  // ─────────────────────────────────────────────
  const handleFolderSelect = async () => {
    try {
      const rootDir = await window.showDirectoryPicker();
      const files = await getAudioFilesRecursive(rootDir);

      const albumsMap = new Map<string, Album>();
      let songId = 0;

      for (const fileHandle of files) {
        const file = await fileHandle.getFile();
        const url = URL.createObjectURL(file);

        let metadata;
        try {
          metadata = await parseBlob(file);
        } catch {
          metadata = null;
        }

        const title =
          metadata?.common.title &&
          metadata.common.title !== metadata.common.album
            ? metadata.common.title
            : file.name.replace(/\.[^/.]+$/, "");

        const artist = metadata?.common.artist || "Desconocido";
        const albumName = metadata?.common.album || "Álbum";

        const albumKey = `${albumName}__${artist}`;

        // Crear álbum SOLO una vez
        if (!albumsMap.has(albumKey)) {
          let coverUrl: string | undefined;

          // 1️⃣ Portada embebida
          if (metadata?.common.picture?.length) {
            const pic = metadata.common.picture[0];
            const blob = new Blob([pic.data], { type: pic.format });
            coverUrl = URL.createObjectURL(blob);
          }

          // 2️⃣ cover.jpg en carpeta raíz
          if (!coverUrl) {
            coverUrl = await findCoverInFolder(rootDir);
          }

          albumsMap.set(albumKey, {
            id: albumKey,
            album: albumName,
            artist,
            cover_url: coverUrl,
            songs: [],
          });
        }

        albumsMap.get(albumKey)!.songs.push({
          id: `${songId++}`,
          title,
          artist,
          album: albumName,
          file,
          url,
        });
      }

      setAlbums(Array.from(albumsMap.values()));
      setError(null);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar la carpeta de música.");
    }
  };

  // ─────────────────────────────────────────────
  // INTERACCIÓN
  // ─────────────────────────────────────────────
  const handleAlbumClick = (album: Album) => {
    setSelectedAlbumId(
      selectedAlbumId === album.id ? null : album.id
    );
  };

  const handleSongClick = (song: Song) => {
    const album = albums.find((a) =>
      a.songs.some((s) => s.id === song.id)
    );
    if (!album) return;

    setCurrentSongList(album.songs);
    setCurrentIndex(album.songs.findIndex((s) => s.id === song.id));
    setCurrentSong(song);
  };

  const handleChangeSong = (index: number) => {
    const song = currentSongList[index];
    if (song) {
      setCurrentIndex(index);
      setCurrentSong(song);
    }
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="App">
      <h1>GMusic</h1>

      <button onClick={handleFolderSelect}>
        Seleccionar carpeta de música
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

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
