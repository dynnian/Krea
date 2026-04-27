// app/components/Explore/ExploreMusic.tsx
// deno-lint-ignore-file
import React, { useEffect, useRef, useState } from "react";
import { Empty, Spin, message } from "antd";
import { Bookmark, Heart, Pause, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext.tsx";
import { collectionsApi } from "../../services/collectionsService.ts";
import { postsApi } from "../../services/postsService.ts";
import { userService } from "../../services/userService.ts";
import type { ExplorePostDto } from "../../types/api.ts";
import AudioWaveform from "../WaveSurfer/AudioWaveform.tsx";

interface ExploreMusicProps {
  selectedTag?: string | null;
  selectedArtist?: string | null;
}

interface AlbumForMusic {
  id: string;
  title: string;
  coverUrl: string;
  ownerName: string;
}

const MOCK_TRENDING_GENRES = [
  "Rock",
  "Pop",
  "Jazz",
  "Hip Hop",
  "Electronic",
  "Classical",
];

const MOCK_TRENDING_ARTISTS = [
  "Said_lol",
  "Krea Beats",
  "Dream Composer",
  "Midnight Audio",
  "Pixel Sound",
];

const getPostGenres = (post: ExplorePostDto) => {
  const genres =
    post.genres ??
    (post as any).Genres ??
    (post as any).genreNames ??
    (post as any).GenreNames ??
    [];

  return Array.isArray(genres) ? genres : [];
};

const getCoverUrl = (post: ExplorePostDto) => {
  return (
    post.coverUrl ||
    (post as any).CoverUrl ||
    (post as any).mediaPreviewCoverUrl ||
    "https://placehold.co/400x400?text=Krea"
  );
};

const getAudioUrl = (post: ExplorePostDto) => {
  return post.previewUrl || (post as any).mediaPreviewUrl || "";
};

const getAuthorName = (post: ExplorePostDto) => {
  return (
    post.authorUsername ||
    (post as any).AuthorUsername ||
    (post as any).authorName ||
    (post as any).AuthorName ||
    "Artista"
  );
};

function CircleActionButton({
  children,
  onClick,
  disabled = false,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={`w-11 h-11 rounded-full border flex items-center justify-center transition ${
        disabled
          ? "border-gray-300 bg-gray-200 text-gray-400 cursor-not-allowed"
          : "border-[#0B5107] bg-[#E9FDE8] text-[#0B5107] cursor-pointer hover:bg-[#DDF6DB]"
      }`}
    >
      {children}
    </button>
  );
}

function AlbumCard({
  album,
  isAuthenticated,
}: {
  album: AlbumForMusic;
  isAuthenticated: boolean;
}) {
  const navigate = useNavigate();

  const handleAlbumClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    navigate(`/album/${album.id}`);
  };

  return (
    <button
      type="button"
      onClick={handleAlbumClick}
      className="min-w-0 text-left bg-transparent border-0 p-0 cursor-pointer"
    >
      <div className="aspect-square overflow-hidden rounded-[10px] shadow-[4px_4px_4px_rgba(0,0,0,0.15)] mb-2">
        <img
          src={album.coverUrl}
          alt={album.title}
          className="w-full h-full object-cover hover:scale-105 transition duration-200"
        />
      </div>

      <div className="flex flex-col">
        <span className="text-[#1B1C1E] mx-[4px] hover:underline text-[18px] font-semibold leading-tight truncate">
          {album.title}
        </span>
        <span className="text-[#6B6B6B] mx-[4px] hover:underline text-[14px] leading-tight truncate">
          {album.ownerName}
        </span>
      </div>
    </button>
  );
}

function MusicFeaturedCard({
  song,
  onLike,
  onFavorite,
  onFollow,
}: {
  song: ExplorePostDto;
  onLike: (id: string) => void;
  onFavorite: (id: string) => void;
  onFollow: (userId: string) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaveReady, setIsWaveReady] = useState(false);

  const waveformControls = useRef<{
    playPause: () => void;
    pause?: () => void;
  } | null>(null);

  const genres = getPostGenres(song);
  const audioUrl = getAudioUrl(song);
  const authorName = getAuthorName(song);

  return (
    <section className="w-full min-h-[350px] bg-[#E8F1FC] border border-[#8F8E8A] px-[24px] md:px-[94px] pt-[18px] pb-[25px] flex flex-col">
      <div className="shrink-0 pb-[5px]">
        <h2 className="m-0">
          <span className="text-[#1B1C1E] text-[36px] font-bold">
            Destacado
          </span>
        </h2>
      </div>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex h-full min-h-0 flex-col md:flex-row gap-6 items-stretch flex-1">
          <img
            src={getCoverUrl(song)}
            alt={song.title ?? "Canción destacada"}
            className="w-full md:w-auto md:h-[250px] aspect-square object-cover rounded shadow-[4px_4px_4px_rgba(0,0,0,0.15)]"
          />

          <div className="h-full flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-start pt-[17px] justify-between gap-4 md:gap-6">
              <div className="self-start min-w-0">
                <div className="flex items-baseline gap-[23px]">
                  <button
                    type="button"
                    onClick={() => navigate(`/user/${song.userId}`)}
                    className="text-[#6B6B6B] hover:underline cursor-pointer text-[16px] md:text-[18px] leading-none m-0 bg-transparent border-0 p-0"
                  >
                    @{authorName}
                  </button>

                  <button
                    type="button"
                    onClick={() => onFollow(song.userId)}
                    className="h-[24px] px-[22px] rounded-full border border-[#1B1C1E] bg-[#E8F1FC] hover:bg-[#BFD1EA] cursor-pointer"
                  >
                    <span className="text-[#1B1C1E] text-[11px] font-medium leading-none">
                      {song.isFollowingAuthor
                        ? t("profile.unfollow")
                        : t("profile.follow")}
                    </span>
                  </button>
                </div>

                <div className="pb-[10px]">
                  <button
                    type="button"
                    onClick={() => navigate(`/post/${song.id}`)}
                  >
                    <span className="text-[#1B1C1E] hover:underline cursor-pointer text-[30px] font-semibold bg-transparent border-0 p-0 text-left"> 
                      {song.title ?? "Sin título"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-row gap-2 self-start flex-wrap justify-start md:justify-end">
                {genres.length > 0 ? (
                  genres.map((genre) => (
                    <span
                      key={genre}
                      className="inline-flex items-center justify-center h-[26px] px-4 rounded-full border border-[#464749] text-[#464749] text-[11px] font-medium bg-[#E8F1FC]"
                    >
                      {genre}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center justify-center h-[26px] px-4 rounded-full border border-[#464749] text-[#464749] text-[11px] font-medium bg-[#E8F1FC]">
                    Sin género
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-[15px] w-full">
              <div className="w-full relative">
                {audioUrl ? (
                  <AudioWaveform
                    audioUrl={audioUrl}
                    showPlayButton={false}
                    showTime={true}
                    onPlayingChange={setIsPlaying}
                    onReady={(actions) => {
                      waveformControls.current = actions;
                      setIsWaveReady(true);
                    }}
                  />
                ) : (
                  <div className="text-center text-[#6B6B6B] py-8">
                    {t("explore.music.no_audio", "No hay audio disponible.")}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-4">
                <CircleActionButton
                  ariaLabel="Dar me gusta"
                  onClick={() => onLike(song.id)}
                >
                  <Heart
                    size={20}
                    className={
                      song.isLikedByCurrentUser
                        ? "fill-[#0B5107] text-[#0B5107]"
                        : ""
                    }
                  />
                </CircleActionButton>

                <CircleActionButton
                  ariaLabel="Reproducir canción destacada"
                  disabled={!isWaveReady}
                  onClick={() => waveformControls.current?.playPause()}
                >
                  {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                </CircleActionButton>

                <CircleActionButton
                  ariaLabel="Guardar canción"
                  onClick={() => onFavorite(song.id)}
                >
                  <Bookmark
                    size={20}
                    className={
                      song.isFavorite ? "fill-[#0B5107] text-[#0B5107]" : ""
                    }
                  />
                </CircleActionButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExploreSongCard({
  song,
  onLike,
  onFavorite,
}: {
  song: ExplorePostDto;
  onLike: (id: string) => void;
  onFavorite: (id: string) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaveReady, setIsWaveReady] = useState(false);

  const waveformControls = useRef<{
    playPause: () => void;
    pause?: () => void;
  } | null>(null);

  const genres = getPostGenres(song);
  const audioUrl = getAudioUrl(song);
  const authorName = getAuthorName(song);

  return (
    <div className="w-full min-h-[240px] bg-[#E8F1FC] border border-[#8F8E8A] rounded-[10px] shadow-[4px_4px_4px_rgba(0,0,0,0.15)] p-[20px]">
      <div className="flex flex-col md:flex-row gap-4 items-stretch h-full">
        <img
          src={getCoverUrl(song)}
          alt={song.title ?? "Canción"}
          className="w-full md:w-auto md:h-[198px] aspect-square object-cover rounded shadow-[4px_4px_4px_rgba(0,0,0,0.15)]"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-[0px]">
            <h1 className="m-0 min-w-0">
              <button
                type="button"
                onClick={() => navigate(`/post/${song.id}`)}
                className="text-[30px] hover:underline cursor-pointer text-[#1B1C1E] font-bold bg-transparent border-0 p-0 text-left truncate max-w-full"
              >
                {song.title ?? "Sin título"}
              </button>
            </h1>

            <span className="text-[15px] text-[#1B1C1E] whitespace-nowrap hidden md:block">
              {genres.length ? genres.join(", ") : "Sin género"}
            </span>
          </div>

          <div className="pb-[18px]">
            <button
              type="button"
              onClick={() => navigate(`/profile/${song.userId}`)}
              className="hover:underline cursor-pointer text-[#6B6B6B] text-[20px] bg-transparent border-0 p-0"
            >
              @{authorName}
            </button>
          </div>

          <div className="px-0 md:px-[35px]">
            {audioUrl ? (
              <AudioWaveform
                audioUrl={audioUrl}
                showPlayButton={false}
                showTime={true}
                onPlayingChange={setIsPlaying}
                onReady={(actions) => {
                  waveformControls.current = actions;
                  setIsWaveReady(true);
                }}
              />
            ) : (
              <div className="text-center text-[#6B6B6B] py-5">
                {t("explore.music.no_audio", "No hay audio disponible.")}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4 pt-[10px]">
            <CircleActionButton
              ariaLabel="Dar me gusta"
              onClick={() => onLike(song.id)}
            >
              <Heart
                size={20}
                className={
                  song.isLikedByCurrentUser
                    ? "fill-[#0B5107] text-[#0B5107]"
                    : ""
                }
              />
            </CircleActionButton>

            <CircleActionButton
              ariaLabel="Reproducir canción"
              disabled={!isWaveReady}
              onClick={() => waveformControls.current?.playPause()}
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </CircleActionButton>

            <CircleActionButton
              ariaLabel="Guardar canción"
              onClick={() => onFavorite(song.id)}
            >
              <Bookmark
                size={20}
                className={
                  song.isFavorite ? "fill-[#0B5107] text-[#0B5107]" : ""
                }
              />
            </CircleActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function MusicSidebar() {
  return (
    <aside className="w-full lg:w-[300px] shrink-0">
      <div className="bg-[#E8F1FC] border border-[#8F8E8A] rounded-[10px] p-[18px] shadow-[4px_4px_4px_rgba(0,0,0,0.10)]">
        <h3 className="m-0 pb-[14px] text-[#1B1C1E] text-[22px] font-bold">
          Géneros en tendencia
        </h3>

        <div className="flex flex-wrap gap-2">
          {MOCK_TRENDING_GENRES.map((genre) => (
            <span
              key={genre}
              className="inline-flex h-[28px] px-4 items-center justify-center rounded-full border border-[#464749] text-[#464749] text-[12px] bg-[#E8F1FC]"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-[#E8F1FC] border border-[#8F8E8A] rounded-[10px] p-[18px] shadow-[4px_4px_4px_rgba(0,0,0,0.10)]">
        <h3 className="m-0 pb-[14px] text-[#1B1C1E] text-[22px] font-bold">
          Artistas en tendencia
        </h3>

        <div className="flex flex-col gap-3">
          {MOCK_TRENDING_ARTISTS.map((artist) => (
            <div
              key={artist}
              className="flex items-center justify-between gap-3 border-b border-[#C4C3BF] last:border-b-0 pb-2 last:pb-0"
            >
              <span className="text-[#1B1C1E] text-[15px] truncate">
                @{artist}
              </span>

              <button
                type="button"
                className="h-[24px] px-[14px] rounded-full border border-[#1B1C1E] bg-[#E8F1FC] hover:bg-[#BFD1EA] cursor-pointer text-[11px]"
              >
                Seguir
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function ExploreMusic({
  selectedTag,
  selectedArtist,
}: ExploreMusicProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  const [featuredTrack, setFeaturedTrack] = useState<ExplorePostDto | null>(null);
  const [tracks, setTracks] = useState<ExplorePostDto[]>([]);
  const [albums, setAlbums] = useState<AlbumForMusic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  const updateTrack = (
    postId: string,
    updater: (track: ExplorePostDto) => ExplorePostDto
  ) => {
    setTracks((prev) =>
      prev.map((track) => (track.id === postId ? updater(track) : track))
    );

    setFeaturedTrack((prev) =>
      prev && prev.id === postId ? updater(prev) : prev
    );
  };

  const updateAuthorFollow = (
    userId: string,
    updater: (track: ExplorePostDto) => ExplorePostDto
  ) => {
    setTracks((prev) =>
      prev.map((track) => (track.userId === userId ? updater(track) : track))
    );

    setFeaturedTrack((prev) =>
      prev && prev.userId === userId ? updater(prev) : prev
    );
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const tags = selectedTag ? [selectedTag] : undefined;

        const [featuredRes, musicRes] = await Promise.all([
          postsApi.explore({
            category: "Music",
            tags,
            sortBy: "trending",
            page: 1,
            pageSize: 1,
          }),
          postsApi.explore({
            category: "Music",
            tags,
            page: 1,
            pageSize: 20,
          }),
        ]);

        const featured = featuredRes.data?.items?.[0] ?? null;
        const items = musicRes.data?.items ?? [];

        setFeaturedTrack(featured);
        setTracks(items);
      } catch (err) {
        console.error("Error loading explore music:", err);
        message.error(t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [selectedTag, selectedArtist, t]);

  useEffect(() => {
    const loadAlbums = async () => {
      setLoadingAlbums(true);

      try {
        const res = await collectionsApi.exploreCollections({
          sortBy: "newest",
          pageSize: 10,
        });

        const all = res.data?.items ?? [];

        const musicAlbums = all
          .filter((collection: any) => collection.type === 1)
          .slice(0, 4)
          .map((collection: any) => ({
            id: collection.id,
            title: collection.title,
            coverUrl:
              collection.coverUrl || "https://placehold.co/400x400?text=Album",
            ownerName: collection.ownerName || "Artista",
          }));

        setAlbums(musicAlbums);
      } catch (err) {
        console.error("Error loading explore albums:", err);
      } finally {
        setLoadingAlbums(false);
      }
    };

    void loadAlbums();
  }, []);

  const handleLike = async (postId: string) => {
    if (!isAuthenticated || !user) {
      message.warning(t("post.auth_required"));
      return;
    }

    const source =
      tracks.find((track) => track.id === postId) ??
      (featuredTrack?.id === postId ? featuredTrack : null);

    if (!source) return;

    const wasLiked = source.isLikedByCurrentUser;

    updateTrack(postId, (track) => ({
      ...track,
      isLikedByCurrentUser: !wasLiked,
      likesCount: Math.max(0, (track.likesCount ?? 0) + (wasLiked ? -1 : 1)),
    }));

    try {
      if (wasLiked) {
        await postsApi.unlike(postId, { postId, userId: user.id });
      } else {
        await postsApi.like(postId, { postId, userId: user.id });
      }
    } catch (error) {
      console.error("Error toggling like in ExploreMusic:", error);

      updateTrack(postId, (track) => ({
        ...track,
        isLikedByCurrentUser: wasLiked,
        likesCount: Math.max(0, (track.likesCount ?? 0) + (wasLiked ? 1 : -1)),
      }));

      message.error(t("post.like_error"));
    }
  };

  const handleFavorite = async (postId: string) => {
    if (!isAuthenticated) {
      message.warning(t("post.auth_required"));
      return;
    }

    const source =
      tracks.find((track) => track.id === postId) ??
      (featuredTrack?.id === postId ? featuredTrack : null);

    if (!source) return;

    const wasFavorite = source.isFavorite;

    updateTrack(postId, (track) => ({
      ...track,
      isFavorite: !wasFavorite,
    }));

    try {
      await postsApi.toggleFavorite(postId);
    } catch (error) {
      console.error("Error toggling favorite in ExploreMusic:", error);

      updateTrack(postId, (track) => ({
        ...track,
        isFavorite: wasFavorite,
      }));

      message.error(t("post.bookmark_error"));
    }
  };

  const handleFollow = async (userId: string) => {
    if (!isAuthenticated) {
      message.warning(t("post.auth_required"));
      return;
    }

    const source =
      tracks.find((track) => track.userId === userId) ??
      (featuredTrack?.userId === userId ? featuredTrack : null);

    if (!source) return;

    const wasFollowing = source.isFollowingAuthor;

    updateAuthorFollow(userId, (track) => ({
      ...track,
      isFollowingAuthor: !wasFollowing,
    }));

    try {
      if (wasFollowing) {
        await userService.unfollow(userId);
      } else {
        await userService.follow(userId);
      }
    } catch (error) {
      console.error("Error toggling follow in ExploreMusic:", error);

      updateAuthorFollow(userId, (track) => ({
        ...track,
        isFollowingAuthor: wasFollowing,
      }));

      message.error(t("profile.follow_error"));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Spin size="large" />
      </div>
    );
  }

  const latestTracks = tracks.filter((track) => track.id !== featuredTrack?.id);

  return (
    <div className="w-full pt-0">
      {(selectedTag || selectedArtist) && (
        <div className="max-w-[1129px] mx-auto mb-4 text-[#1B1C1E] text-sm px-4">
          {selectedTag && <span>Tag: {selectedTag}</span>}
          {selectedTag && selectedArtist && <span> · </span>}
          {selectedArtist && <span>Artist: {selectedArtist}</span>}
        </div>
      )}

      {featuredTrack ? (
        <MusicFeaturedCard
          song={featuredTrack}
          onLike={handleLike}
          onFavorite={handleFavorite}
          onFollow={handleFollow}
        />
      ) : (
        <div className="flex justify-center py-20">
          <Empty description="No hay canciones destacadas para mostrar." />
        </div>
      )}

      <div className="mt-6 flex flex-col lg:flex-row gap-6 pb-[20px] max-w-[1129px] mx-auto px-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-8">
            {!loadingAlbums && albums.length > 0 && (
              <section>
                <div className="pb-[10px]">
                  <h3 className="m-0">
                    <span className="text-[#1B1C1E] text-[24px] font-bold">
                      ¡Álbumes nuevos!
                    </span>
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-5">
                  {albums.map((album) => (
                    <AlbumCard
                      key={album.id}
                      album={album}
                      isAuthenticated={isAuthenticated}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="pb-[10px]">
                <h3 className="m-0">
                  <span className="text-[#1B1C1E] text-[24px] font-bold">
                    Canciones nuevas
                  </span>
                </h3>
              </div>

              {latestTracks.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {latestTracks.map((song) => (
                    <ExploreSongCard
                      key={song.id}
                      song={song}
                      onLike={handleLike}
                      onFavorite={handleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-10 bg-[#E8F1FC] border border-[#8F8E8A] rounded-[10px]">
                  <Empty description="No hay canciones nuevas para mostrar." />
                </div>
              )}
            </section>
          </div>
        </div>

        <MusicSidebar />
      </div>
    </div>
  );
}