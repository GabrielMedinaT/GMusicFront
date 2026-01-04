import React, { useState } from "react";
import { Song } from "../types/types";
import { saveSongEdits } from "../utils/songEditsStore";
import "./EditSongModal.css";

interface EditSongModalProps {
  song: Song;
  onClose: () => void;
}

const EditSongModal: React.FC<EditSongModalProps> = ({
  song,
  onClose,
}) => {
  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist);
  const [album, setAlbum] = useState(song.album);

  const handleSave = async () => {
    await saveSongEdits(song.id, {
      title,
      artist,
      album,
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Editar canción</h2>

        <label>
          Título
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label>
          Artista
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
        </label>

        <label>
          Álbum
          <input
            type="text"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
          />
        </label>

        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default EditSongModal;
