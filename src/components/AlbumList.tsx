import React from "react";
import { Album } from "../types/types";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import "./AlbumList.css";

interface AlbumListProps {
  albums: Album[];
  onAlbumClick: (album: Album) => void;
  selectedAlbumId: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSongClick: (song: any) => void;
}

const AlbumList: React.FC<AlbumListProps> = ({
  albums,
  onAlbumClick,
  selectedAlbumId,
  onSongClick,
}) => {
  return (
    <div className="albums-wrapper">
      <Swiper
        modules={[EffectCoverflow]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        coverflowEffect={{
          rotate: 0,
          stretch: -50,
          depth: 150,
          modifier: 1,
          slideShadows: false,
        }}
        className="album-swiper"
        breakpoints={{
          640: {
            coverflowEffect: {
              stretch: -30,
              depth: 200,
              modifier: 1.5,
            },
          },
          1024: {
            coverflowEffect: {
              stretch: -20,
              depth: 300,
              modifier: 2,
            },
          },
        }}
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
                  style={{ backgroundImage: `url(${album.cover_url})` }}
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
