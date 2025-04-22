import React, { useRef, useEffect, useState } from "react";
import { Song } from "../types/types";

interface MusicPlayerProps {
  song: Song | null;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ song }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  //const baseUrl = "https://musica.gmtdev.duckdns.org";
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (song && audioRef.current) {
      const songUrl = getSongUrl(); // Usar `song.file`
      console.log("Intentando cargar URL:", songUrl , " " , song.file , " ");
      setError(null);

      audioRef.current.src = songUrl;
      audioRef.current.load();
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error("Reproducción automática prevenida:", err);
          setError("Error al cargar la canción.");
        });
      }
    }
  }, [song]);

  const getSongUrl = () => {
    if (!song || !song.url) return "";
    console.log("Usando URL directa de la cancion:", song.url);
    return song.url;
  };
  

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          console.error("Error al intentar reproducir:", err);
          setError("Error al reproducir la canción.");
        });
      }
      setIsPlaying(!isPlaying);
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(event.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
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
            <button onClick={handlePlayPause}>
              {isPlaying ? "Pause" : "Play"}
            </button>
            <div className="progress-bar-container">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                className="progress-bar"
                onChange={handleSeek}
              />
              <div className="time-info">
                <span>{formatTime(currentTime)}</span> /{" "}
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
          <div className="audio-element">
            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              key={song.file} // Usar `song.file` como clave
              onError={(e) => {
                console.error("Error de reproducción:", e);
                setError("Error al cargar la canción.");
              }}
            />
          </div>
        </div>
      ) : (
        <p>Selecciona una canción para escuchar</p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default MusicPlayer;
