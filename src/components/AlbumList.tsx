/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from "react";
import { Album, Song } from "../types/types";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { EffectCoverflow } from "swiper/modules";

import "./AlbumList.css";

interface AlbumListProps {
  albums: Album[];
  onAlbumClick: (album: Album) => void;
  selectedAlbumId: string | null;
  onSongClick: (song: Song) => void;
}

const AlbumList: React.FC<AlbumListProps> = ({
  albums,
  onAlbumClick,
  selectedAlbumId,
  onSongClick,
}) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // ✅ Scroll logic corregida
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let locked = false;

    const onWheel = (e: WheelEvent) => {
      // 1. Detectamos sobre qué elemento está el ratón
      const target = e.target as HTMLElement;

      // 2. Verificamos si estamos intentando hacer scroll dentro de la lista de canciones
      // Buscamos si el elemento target tiene un ancestro con la clase .back
      const isInsideBack = target.closest('.back');

      // 3. LA CORRECCIÓN:
      // Si hay un álbum seleccionado Y el ratón está sobre la parte trasera...
      if (selectedAlbumId && isInsideBack) {
        // ... NO ejecutamos e.preventDefault().
        // Esto permite que el navegador haga scroll en la lista de canciones.
        // Y hacemos return para no mover el Swiper.
        return; 
      }

      // --- Si no estamos en la lista, comportamiento normal del carrusel ---
      
      e.preventDefault(); // Bloquea el scroll de la página

      if (!swiperRef.current) return;
      if (locked) return;

      locked = true;

      if (e.deltaY > 0) swiperRef.current.slideNext();
      else swiperRef.current.slidePrev();

      setTimeout(() => {
        locked = false;
      }, 250);
    };

    // passive: false es obligatorio para poder usar preventDefault
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel as any);
    };
  }, [selectedAlbumId]); // ⚠️ IMPORTANTE: Añadimos selectedAlbumId a las dependencias

  return (
    <div className="albums-wrapper" ref={wrapperRef}>
      <Swiper
        modules={[EffectCoverflow]}
        onSwiper={(s) => (swiperRef.current = s)}
        effect="coverflow"
        centeredSlides
        slidesPerView="auto"
        grabCursor={!selectedAlbumId} // Tip visual: quitamos la manita de arrastre si hay un album abierto
        speed={450}
        // Deshabilitar el slide con ratón si hay un álbum abierto para evitar conflictos
        allowTouchMove={!selectedAlbumId} 
        coverflowEffect={{
          rotate: 25,
          stretch: 0,
          depth: 120,
          modifier: 1,
          slideShadows: false,
        }}
        className="album-swiper"
      >
        {albums.map((album) => (
          <SwiperSlide key={album.id}>
            <div
              className="album-container"
              onClick={(e) => {
                // Si haces click en el contenedor general, giramos
                e.stopPropagation();
                onAlbumClick(album);
              }}
            >
              <div
                className={`album ${
                  selectedAlbumId === album.id ? "rotated" : ""
                }`}
              >
                <div
                  className="front"
                  style={{
                    backgroundImage: album.cover_url
                      ? `url(${album.cover_url})`
                      : undefined,
                  }}
                >
                    {/* Aquí podrías poner el botón de flip que hicimos antes si quieres */}
                </div>

                <div className="back">
                  <ul className="song-list">
                    {album.songs.map((song) => (
                      <li
                        key={song.id}
                        onClick={(e) => {
                          // Importante: detener la propagación para que el click en la canción
                          // no se detecte como click en el álbum y lo cierre/gire.
                          e.stopPropagation();
                          onSongClick(song);
                        }}
                      >
                        {song.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default AlbumList;