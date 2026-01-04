import React, { useRef, useEffect, useState } from "react";
import { Song } from "../types/types";
import "./MusicPlayer.css";

interface MusicPlayerProps {
  song: Song | null;
  songs: Song[];
  onChangeSong: (index: number) => void;
  currentIndex: number;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  song,
  songs,
  onChangeSong,
  currentIndex,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Cargar nueva canción
  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;

    if (song?.url) {
      setError(null);

      audioRef.current.src = song.url;
      audioRef.current.load();

      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Reproducción automática bloqueada:", err);
          setError("No se pudo reproducir la canción.");
        });
    }
  }, [song]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error("Error al reproducir:", err);
        setError("Error al reproducir la canción.");
      });
    }

    setIsPlaying(!isPlaying);
  };
  const handleEnded = () => {
  if (songs.length === 0) return;

  const nextIndex = currentIndex + 1;

  if (nextIndex < songs.length) {
    onChangeSong(nextIndex);
  } else {
    setIsPlaying(false);
  }
};


  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = Number(event.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleNext = () => {
    if (songs.length === 0) return;
    const nextIndex = (currentIndex + 1) % songs.length;
    onChangeSong(nextIndex);
  };

  const handlePrevious = () => {
    if (songs.length === 0) return;
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    onChangeSong(prevIndex);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="music-player">
      {song ? (
        <div className="player-content">
          <div className="song-info">
            <h3>{song.title}</h3>
            <p>{song.artist}</p>
            <p>{song.album}</p>
          </div>

          <div className="audio-controls">
            <div className="buttons-row">
              <button onClick={handlePrevious}>⏮️</button>
              <button onClick={handlePlayPause}>
                {isPlaying ? "⏸️" : "▶️"}
              </button>
              <button onClick={handleNext}>⏭️</button>
            </div>

            <div className="progress-bar-container">
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="progress-bar"
              />
              <div className="time-info">
                <span>{formatTime(currentTime)}</span> /{" "}
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={(e) => {
              console.error("Error de reproducción:", e);
              setError("Error al cargar la canción.");
            }}
            key={song.id}
          />
        </div>
      ) : (
        <p>Selecciona una canción para escuchar</p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default MusicPlayer;
