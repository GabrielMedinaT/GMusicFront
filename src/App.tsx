import React, { useEffect, useState, useMemo } from "react";
import AlbumList from "./components/AlbumList";
import MusicPlayer from "./components/MusicPlayer";
import { Album, Song } from "./types/types";
import { parseBlob } from "music-metadata-browser";
import {
  saveMusicFolderHandle,
  getMusicFolderHandle,
  verifyReadPermission,
} from "./utils/folderStore";
import "./App.css";
import EditSongModal from "./components/EditSongModal";
import { getSongEdits } from "./utils/songEditsStore";


const AUDIO_EXTENSIONS = ["mp3", "ogg", "wav", "flac", "m4a", "aac", "webm"];
const COVER_NAMES = ["cover", "folder", "front", "album", "artwork", "picture"];

const App: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSongList, setCurrentSongList] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const loadMusicFromDirectory = async (rootDir: FileSystemDirectoryHandle) => {
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

      const originalTitle =
        metadata?.common.title &&
        metadata.common.title !== metadata.common.album
          ? metadata.common.title
          : file.name.replace(/\.[^/.]+$/, "");

      const originalArtist = metadata?.common.artist || "Desconocido";
      const originalAlbum = metadata?.common.album || "Álbum";

      const albumKey = `${originalAlbum}__${originalArtist}`;

      if (!albumsMap.has(albumKey)) {
        let coverUrl: string | undefined;

        if (metadata?.common.picture?.length) {
          const pic = metadata.common.picture[0];
          const blob = new Blob([pic.data], { type: pic.format });
          coverUrl = URL.createObjectURL(blob);
        }

        if (!coverUrl) {
          coverUrl = await findCoverInFolder(rootDir);
        }

        albumsMap.set(albumKey, {
          id: albumKey,
          album: originalAlbum,
          artist: originalArtist,
          cover_url: coverUrl,
          songs: [],
        });
      }

      const id = `${songId++}`;

      const edits = await getSongEdits(id);

      albumsMap.get(albumKey)!.songs.push({
        id,
        title: edits?.title ?? originalTitle,
        artist: edits?.artist ?? originalArtist,
        album: edits?.album ?? originalAlbum,
        file,
        url,
      });
    }

    setAlbums(Array.from(albumsMap.values()));
    setError(null);
  };

  const handleFolderSelect = async () => {
    try {
      if (!window.showDirectoryPicker) {
        setError("File System Access API no es soportada en este navegador.");
        return;
      }
      const rootDir = await window.showDirectoryPicker();
      await saveMusicFolderHandle(rootDir as FileSystemDirectoryHandle);
      await loadMusicFromDirectory(rootDir as FileSystemDirectoryHandle);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar la carpeta de música.");
    }
  };

  useEffect(() => {
    const autoLoad = async () => {
      const handle = await getMusicFolderHandle();
      if (!handle) return;

      const hasPermission = await verifyReadPermission(handle);
      if (!hasPermission) return;

      await loadMusicFromDirectory(handle as FileSystemDirectoryHandle);
    };

    autoLoad();
  }, []);

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbumId(selectedAlbumId === album.id ? null : album.id);
  };

  const handleSongClick = (song: Song) => {
    const album = albums.find((a) => a.songs.some((s) => s.id === song.id));
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
  const filteredAlbums = useMemo(() => {
    if (!searchTerm.trim()) return albums;

    const term = searchTerm.toLowerCase();

    return albums
      .map((album) => {
        const matchesAlbum =
          album.album.toLowerCase().includes(term) ||
          album.artist.toLowerCase().includes(term);

        const filteredSongs = album.songs.filter(
          (song) =>
            song.title.toLowerCase().includes(term) ||
            song.artist.toLowerCase().includes(term) ||
            song.album.toLowerCase().includes(term)
        );

        if (matchesAlbum || filteredSongs.length > 0) {
          return {
            ...album,
            songs: matchesAlbum ? album.songs : filteredSongs,
          };
        }

        return null;
      })
      .filter(Boolean) as Album[];
  }, [albums, searchTerm]);
  useEffect(() => {
    if (!searchTerm) {
      setShowSearch(false);
    }
  }, [searchTerm]);

  return (
    <div className="App">
      <nav className="menu-bar">
        <ul className="menu">
          <li className="menu-item">
            Archivo
            <ul className="submenu">
              <li onClick={handleFolderSelect}>Abrir carpeta…</li>
              <li>Salir</li>
            </ul>
          </li>

          <li className="menu-item">
            Edición
            <ul className="submenu">
              <li
                onClick={() => {
                  setShowSearch(true);
                }}
              >
                Buscar
              </li>

              <li
                onClick={() => {
                  if (currentSong) {
                    setShowEditModal(true);
                  }
                }}
                style={{
                  opacity: currentSong ? 1 : 0.5,
                  pointerEvents: currentSong ? "auto" : "none",
                }}
              >
                Editar canción
              </li>
            </ul>
          </li>

          <li className="menu-item">
            Herramientas
            <ul className="submenu">
              <li>Preferencias</li>
            </ul>
          </li>

          <li className="menu-item">
            Ayuda
            <ul className="submenu">
              <li>Acerca de</li>
            </ul>
          </li>
        </ul>
      </nav>
      {showSearch && (
        <input
          type="text"
          placeholder="Buscar canción, álbum o artista"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            margin: "10px 0",
            padding: "8px 12px",
            width: "100%",
            maxWidth: "400px",
            borderRadius: "10px",
            border: "1px solid #ccc",
          }}
        />
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <AlbumList
        albums={filteredAlbums}
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
      {showEditModal && currentSong && (
        <EditSongModal
          song={currentSong}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default App;
