import React from "react";
import { Album } from "../types/types";  // Importar el tipo unificado
import './AlbumList.css';

interface AlbumListProps {
  albums: Album[];
  onAlbumClick: (album: Album) => void;
}

const AlbumList: React.FC<AlbumListProps> = ({ albums, onAlbumClick }) => {
  return (
    <div>
      {albums.map((album) => (
        <div key={album.id} onClick={() => onAlbumClick(album)}>
          <h3>{album.album}</h3>
          <p>{album.artist}</p>
          {album.cover_url && <img src={album.cover_url} alt={album.album} />}
        </div>
      ))}
    </div>
  );
};

export default AlbumList;
