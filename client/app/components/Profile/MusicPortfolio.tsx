// deno-lint-ignore-file
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, message } from "antd";
import type { MenuProps } from "antd";
import { Bookmark, Heart, Play, Pause, MoreHorizontal, ChevronLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.tsx";
import { postsApi } from "../../services/postsService.ts";
import { collectionsApi } from "../../services/collectionsService.ts";
import AudioWaveform from "../WaveSurfer/AudioWaveform.tsx";

export type MusicSong = {
  id: string;
  title: string;
  postId: string;
  genre: string;
  coverUrl: string;
  audioUrl: string;
  likesCount: number;
  isLiked: boolean;
};

export type AlbumTrack = {
  id: string;
  number: number;
  title: string;
  duration: string;
  audioUrl: string;
};

export type MusicAlbum = {
  id: string;
  title: string;
  releaseDate: string;
  songsCount: number;
  coverUrl: string;
  tracks: AlbumTrack[];
};

type MusicPortfolioProps = {
  initialTab?: "songs" | "albums";
  songs?: MusicSong[];
  albums?: MusicAlbum[];
  error?: string | null;
  onEditAlbum?: (album: MusicAlbum) => void;
};

const SongCard: React.FC<{ song: MusicSong }> = ({ song }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(song.isLiked);
  const [likesCount, setLikesCount] = useState(song.likesCount);
  const [actionLoading, setActionLoading] = useState(false);
  const [isWaveReady, setIsWaveReady] = useState(false);

  useEffect(() => {
    setLiked(song.isLiked);
    setLikesCount(song.likesCount);
  }, [song.postId, song.isLiked, song.likesCount]);

  const waveformControls = useRef<{
    playPause: () => void;
    pause: () => void;
  } | null>(null);

  const openPostDetail = () => {
    navigate(`/post/${song.postId}`);
  };

  const requireAuth = () => {
    if (!user) {
      message.warning("Debes iniciar sesión para dar like.");
      navigate("/login");
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth() || actionLoading) return;

    setActionLoading(true);
    const wasLiked = liked;

    setLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      if (wasLiked) {
        await postsApi.unlike(song.postId, { postId: song.postId, userId: user!.id });
      } else {
        await postsApi.like(song.postId, { postId: song.postId, userId: user!.id });
      }
    } catch {
      setLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      message.error("No se pudo actualizar el like.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#E8F1FC] border border-[#8F8E8A] rounded-[10px] shadow-[4px_4px_4px_rgba(0,0,0,0.15)] p-3 sm:p-4 md:p-5 md:h-[240px]">
      <div className="flex gap-3 sm:gap-4 items-stretch min-h-[170px] sm:min-h-[200px] md:h-full">
        <div
          onClick={openPostDetail}
          className="self-stretch aspect-square shrink-0 min-w-[90px] max-w-[200px] overflow-hidden rounded shadow-[4px_4px_4px_rgba(0,0,0,0.15)] cursor-pointer"
        >
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="h-[24px]" />
            <div className="flex items-start justify-between gap-2 sm:gap-4 mb-1">
              <h1
                className="text-[20px] sm:text-[24px] leading-[22px] sm:leading-[28px] font-medium text-[#1B1C1E] cursor-pointer hover:underline line-clamp-2 min-w-0"
                onClick={openPostDetail}
              >
                {song.title}
              </h1>
              <span className="text-[11px] sm:text-sm text-[#1B1C1E] whitespace-nowrap shrink-0 pl-2">
                {song.genre}
              </span>
            </div>

          <div className="mt-1 cursor-pointer">
            <AudioWaveform
              audioUrl={song.audioUrl}
              showPlayButton={false}
              showTime={true}
              onPlayingChange={setIsPlaying}
              onReady={(actions) => {
                waveformControls.current = actions;
                setIsWaveReady(true);
              }}
            />
          </div>

          <div className="flex items-center justify-center gap-5 mt-4 text-[#0B5107]">
            <button
              type="button"
              onClick={handleLike}
              disabled={actionLoading}
              className="w-10 h-10 rounded-full border cursor-pointer border-[#1B1C1E] bg-[#E9FDE8] flex items-center justify-center disabled:opacity-50"
            >
              <Heart size={18} className={liked ? "fill-[#0B5107] text-[#0B5107]" : ""} />
            </button>

            <button
              type="button"
              disabled={!isWaveReady}
              onClick={() => waveformControls.current?.playPause()}
              className={`w-10 h-10 rounded-full cursor-pointer border border-[#1B1C1E] flex items-center justify-center ${
                isWaveReady
                  ? "bg-[#E9FDE8] text-[#0B5107]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
              type="button"
              className="w-10 h-10 rounded-full border cursor-pointer border-[#1B1C1E] bg-[#E9FDE8] flex items-center justify-center"
            >
              <Bookmark size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function getReleaseYear(releaseDate: string) {
  if (!releaseDate) return "2025";
  const date = new Date(releaseDate);
  return Number.isNaN(date.getTime()) ? "2025" : String(date.getFullYear());
}

function PortfolioViewHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center gap-[10px] pb-[18px]">
      <button
        onClick={onBack}
        className="flex items-center justify-center w-[32px] h-[32px] hover:bg-gray-200 rounded-full transition cursor-pointer"
      >
        <ChevronLeft size={24} className="text-gray-800" />
      </button>
      <div className="pt-[10px]">
        <h1 className="text-[20px] font-medium text-gray-800 leading-none">
          {title}
        </h1>
      </div>
    </div>
  );
}

function MusicPortfolioGeneralCard({
  songs,
  onOpen,
}: {
  songs: MusicSong[];
  onOpen: () => void;
}) {
  const previewCovers = [...songs].slice(0, 3);

  return (
    <div className="w-[220px] text-left bg-transparent">
      <div
        onClick={onOpen}
        className="relative w-[214px] h-[214px] mx-auto cursor-pointer"
      >
        <div className="absolute left-[10px] top-[52px] w-[120px] h-[120px] rotate-[-20deg] rounded-[5px] overflow-hidden shadow-[4px_4px_13px_rgba(0,0,0,0.25)] bg-[#D9D9D9]">
          {previewCovers[2] ? (
            <img
              src={previewCovers[2].coverUrl}
              alt={previewCovers[2].title}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>

        <div className="absolute left-[50px] top-[25px] w-[120px] h-[120px] rotate-[0deg] rounded-[5px] overflow-hidden shadow-[4px_4px_13px_rgba(0,0,0,0.25)] bg-[#D9D9D9]">
          {previewCovers[1] ? (
            <img
              src={previewCovers[1].coverUrl}
              alt={previewCovers[1].title}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>

        <div className="absolute left-[90px] top-[52px] w-[120px] h-[120px] rotate-[20deg] rounded-[5px] overflow-hidden shadow-[4px_4px_13px_rgba(0,0,0,0.25)] bg-[#D9D9D9]">
          {previewCovers[0] ? (
            <img
              src={previewCovers[0].coverUrl}
              alt={previewCovers[0].title}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>
      </div>

      <div className=" mt-[14px] w-[183px] mx-auto">
        <h3
          className="text-[18px] font-medium leading-[20px] text-[#1B1C1E] hover:underline cursor-pointer"
          onClick={onOpen}
        >
          Portafolio general
        </h3>
        <p className="text-[14px] leading-[16px] text-[#1B1C1E] mt-[8px]">
          {songs.length} Canciones
        </p>
      </div>
    </div>
  );
}

function AlbumCard({
  album,
  onEdit,
  onDelete,
}: {
  album: MusicAlbum;
  onEdit: (album: MusicAlbum) => void;
  onDelete: (album: MusicAlbum) => void;
}) {
  const navigate = useNavigate();

  const albumMenuItems: MenuProps["items"] = [
    {
      key: "edit",
      label: "Editar album",
    },
    {
      key: "delete",
      label: "Eliminar album",
      danger: true,
    },
  ];

  const handleAlbumMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "edit") {
      onEdit(album);
      return;
    }

    if (key === "delete") {
      onDelete(album);
    }
  };

  return (
    <div className="w-[220px] text-left bg-transparent">
      <div
        onClick={() => navigate(`/album/${album.id}`)}
        className="w-[214px] h-[214px] rounded-[7px] overflow-hidden shadow-[4px_4px_13px_rgba(0,0,0,0.25)] bg-[#D9D9D9] cursor-pointer block"
      >
        <img
          src={album.coverUrl}
          alt={album.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex items-start justify-between gap-[8px] mt-[14px] mr-[5px]">
        <div className="min-w-0">
          <h3
            className="text-[18px] font-medium leading-[20px] text-[#1B1C1E] truncate cursor-pointer hover:underline"
            onClick={() => navigate(`/album/${album.id}`)}
          >
            {album.title}
          </h3>

          <p className="text-[14px] leading-[16px] text-[#1B1C1E] mt-[8px]">
            {album.songsCount} Canciones · {getReleaseYear(album.releaseDate)}
          </p>
        </div>

        <Dropdown
          menu={{ items: albumMenuItems, onClick: handleAlbumMenuClick }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <button
            type="button"
            className="h-[20px] w-[20px] flex items-center justify-center rounded-full cursor-pointer shrink-0"
          >
            <MoreHorizontal size={16} className="text-[#1B1C1E]" />
          </button>
        </Dropdown>
      </div>
    </div>
  );
}

function AlbumsGrid({
  songs,
  albums,
  onOpenGeneralPortfolio,
  onEditAlbum,
  onDeleteAlbum,
}: {
  songs: MusicSong[];
  albums: MusicAlbum[];
  onOpenGeneralPortfolio: () => void;
  onEditAlbum: (album: MusicAlbum) => void;
  onDeleteAlbum: (album: MusicAlbum) => void;
}) {
  return (
    <div className="w-full px-[20px] m:px-[140px] l:px-[240px] xl:px-[340px] pb-[30px]">
      <div className="grid justify-center gap-x-[20px] gap-y-[20px] [grid-template-columns:repeat(auto-fit,220px)]">
        <MusicPortfolioGeneralCard
          songs={songs}
          onOpen={onOpenGeneralPortfolio}
        />

        {albums.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            onEdit={onEditAlbum}
            onDelete={onDeleteAlbum}
          />
        ))}
      </div>
    </div>
  );
}

export default function MusicPortfolio({
  initialTab = "albums",
  songs = [],
  albums = [],
  error = null,
  onEditAlbum,
}: MusicPortfolioProps) {
  const [activeMusicTab, setActiveMusicTab] = useState<"songs" | "albums">(initialTab);
  const [showGeneralPortfolio, setShowGeneralPortfolio] = useState(false);
  const [localAlbums, setLocalAlbums] = useState<MusicAlbum[]>(albums);

  const hasRealAlbums = albums.length > 0;
  const displayAlbums = hasRealAlbums ? localAlbums : [];

  const handleOpenGeneralPortfolio = () => {
    setShowGeneralPortfolio(true);
  };

  const handleDeleteAlbum = async (album: MusicAlbum) => {
    const isMockAlbum = album.id.startsWith("mock-");

    if (isMockAlbum) {
      setLocalAlbums((prev) => prev.filter((item) => item.id !== album.id));
      message.success("Album eliminado.");
      return;
    }

    try {
      await collectionsApi.deleteCollection(album.id);
      setLocalAlbums((prev) => prev.filter((item) => item.id !== album.id));
      message.success("Album eliminado.");
    } catch (error) {
      console.error("Error deleting album:", error);
      message.error("No se pudo eliminar el album.");
    }
  };

  const handleEditAlbum = (album: MusicAlbum) => {
    onEditAlbum?.(album);
  };

if (showGeneralPortfolio) {
  return (
    <div className="w-full md:-mt-[60px]">
      <div className="max-w-[975px] mx-auto">
        <PortfolioViewHeader
          title="Portafolio General"
          onBack={() => setShowGeneralPortfolio(false)}
        />
      </div>

      <div className="max-w-[975px] mx-auto space-y-4">
          {songs.length > 0 ? (
            songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No hay canciones disponibles.
            </div>
          )}
        </div>
      </div>
    );
}

if (!hasRealAlbums) {
  return (
    <div className="w-full">
      <div className="max-w-[975px] mx-auto space-y-4">
        {songs.length > 0 ? (
          songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No hay canciones disponibles.
          </div>
        )}
      </div>
    </div>
  );
}

return (
  <AlbumsGrid
    songs={songs}
    albums={displayAlbums}
    onOpenGeneralPortfolio={handleOpenGeneralPortfolio}
    onEditAlbum={handleEditAlbum}
    onDeleteAlbum={handleDeleteAlbum}
  />
);
}