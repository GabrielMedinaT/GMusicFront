import React, { useEffect, useRef } from "react";
import { Album, Song } from "../types/types";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { EffectCoverflow } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-coverflow";
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

  // ✅ Scroll con rueda: forzamos slideNext/slidePrev
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let locked = false;

    const onWheel = (e: WheelEvent) => {
      // Si estás sobre el carrusel, consumimos el wheel
      e.preventDefault();

      if (!swiperRef.current) return;
      if (locked) return;

      locked = true;

      if (e.deltaY > 0) swiperRef.current.slideNext();
      else swiperRef.current.slidePrev();

      // throttle para que no vaya a mil por hora
      setTimeout(() => {
        locked = false;
      }, 250);
    };

    // importante: passive:false para poder hacer preventDefault
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel as any);
    };
  }, []);

  return (
    <div className="albums-wrapper" ref={wrapperRef}>
      <Swiper
        modules={[EffectCoverflow]}
        onSwiper={(s) => (swiperRef.current = s)}
        effect="coverflow"
        centeredSlides
        slidesPerView="auto"
        grabCursor
        speed={450}
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
                />

                <div className="back">
                  <ul className="song-list">
                    {album.songs.map((song) => (
                      <li
                        key={song.id}
                        onClick={(e) => {
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
