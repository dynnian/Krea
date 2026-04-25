// app/components/Explore/ExploreMusic.tsx
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Spin, message, Button } from "antd";
import { Heart, Bookmark, Play, Pause, UserPlus, UserCheck } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { postsApi, feedApi } from "../../services/postsService";
import { userService } from "../../services/userService";
import { collectionsApi } from "../../services/collectionsService";
import AudioWaveform from "../WaveSurfer/AudioWaveform";
import type { ExplorePostDto } from "../../types/api";

interface AlbumForMusic {
  id: string;
  title: string;
  coverUrl: string;
  ownerName: string;
}

const AlbumCard: React.FC<{ album: AlbumForMusic }> = ({ album }) => {
  const { t } = useTranslation();
  return (
    <div className="w-40 shrink-0 cursor-pointer hover:opacity-80" onClick={() => (window.location.href = `/album/${album.id}`)}>
      <img src={album.coverUrl || "https://placehold.co/168x168"} alt={album.title} className="w-40 h-40 object-cover rounded shadow-md" />
      <p className="font-semibold text-[#1B1C1E] mt-1 truncate">{album.title}</p>
      <p className="text-sm text-gray-500 truncate">{album.ownerName}</p>
    </div>
  );
};

const MusicFeaturedCard: React.FC<{ song: ExplorePostDto; onLike: (id: string) => void; onFavorite: (id: string) => void; onFollow: (userId: string) => void }> = ({ song, onLike, onFavorite, onFollow }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaveReady, setIsWaveReady] = useState(false);
  const waveformControls = useRef<{ playPause: () => void } | null>(null);
  const audioUrl = song.previewUrl;

  const handlePlayPause = () => {
    if (isWaveReady) waveformControls.current?.playPause();
  };

  return (
    <div className="w-full bg-[#E9F1FC] border border-[#95ACCC] rounded-[10px] p-6 flex flex-col md:flex-row gap-6">
      <img src={song.coverUrl || "https://placehold.co/190x190"} alt={song.title} className="w-48 h-48 object-cover rounded shadow-md" />
      <div className="flex-1">
        <div className="flex justify-between items-start flex-wrap">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-gray-500 text-lg">@{song.authorUsername}</span>
              <Button size="small" onClick={() => onFollow(song.userId)} icon={song.isFollowingAuthor ? <UserCheck size={14} /> : <UserPlus size={14} />}>
                {song.isFollowingAuthor ? t("profile.unfollow") : t("profile.follow")}
              </Button>
            </div>
            <h2 className="text-3xl font-bold text-[#1B1C1E]">{song.title}</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {song.genres.map(g => <span key={g} className="px-3 py-1 rounded-full border border-gray-500 text-xs bg-white">{g}</span>)}
          </div>
        </div>
        <div className="mt-4">
          {audioUrl ? (
            <div className="px-6">
              <AudioWaveform
                audioUrl={audioUrl}
                showPlayButton={false}
                showTime={true}
                onPlayingChange={setIsPlaying}
                onReady={actions => { waveformControls.current = actions; setIsWaveReady(true); }}
              />
            </div>
          ) : (
            <div className="text-center text-gray-400">{t("explore.music.no_audio")}</div>
          )}
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <button onClick={() => onLike(song.id)} className="w-10 h-10 rounded-full border border-green-700 bg-green-50 flex items-center justify-center">
            <Heart size={20} className={song.isLikedByCurrentUser ? "fill-green-700 text-green-700" : ""} />
          </button>
          <button onClick={handlePlayPause} disabled={!isWaveReady} className="w-10 h-10 rounded-full border border-green-700 bg-green-50 flex items-center justify-center">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button onClick={() => onFavorite(song.id)} className="w-10 h-10 rounded-full border border-green-700 bg-green-50 flex items-center justify-center">
            <Bookmark size={20} className={song.isFavorite ? "fill-green-700" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
};

const MusicTrackCard: React.FC<{ track: ExplorePostDto; onLike: (id: string) => void; onFavorite: (id: string) => void }> = ({ track, onLike, onFavorite }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaveReady, setIsWaveReady] = useState(false);
  const waveformControls = useRef<{ playPause: () => void } | null>(null);
  const audioUrl = track.previewUrl;

  const handlePlayPause = () => {
    if (isWaveReady) waveformControls.current?.playPause();
  };

  return (
    <div className="bg-[#E9F1FC] border border-[#95ACCC] rounded-[10px] p-5 flex gap-5">
      <img src={track.coverUrl || "https://placehold.co/180x180"} alt={track.title} className="w-44 h-44 object-cover rounded shadow-md" />
      <div className="flex-1">
        <div className="flex justify-between">
          <div>
            <h3 className="text-2xl font-semibold">{track.title}</h3>
            <p className="text-gray-500">@{track.authorUsername}</p>
          </div>
          <div className="text-gray-600">{track.genres.join(", ")}</div>
        </div>
        {audioUrl ? (
          <div className="mt-3 px-8">
            <AudioWaveform
              audioUrl={audioUrl}
              showPlayButton={false}
              showTime={true}
              onPlayingChange={setIsPlaying}
              onReady={actions => { waveformControls.current = actions; setIsWaveReady(true); }}
            />
          </div>
        ) : (
          <div className="text-center text-gray-400 py-4">{t("explore.music.no_audio")}</div>
        )}
        <div className="flex justify-center gap-4 mt-2">
          <button onClick={() => onLike(track.id)} className="w-9 h-9 rounded-full border border-green-700 bg-green-50 flex items-center justify-center">
            <Heart size={18} className={track.isLikedByCurrentUser ? "fill-green-700" : ""} />
          </button>
          <button onClick={handlePlayPause} disabled={!isWaveReady} className="w-9 h-9 rounded-full border border-green-700 bg-green-50 flex items-center justify-center">
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button onClick={() => onFavorite(track.id)} className="w-9 h-9 rounded-full border border-green-700 bg-green-50 flex items-center justify-center">
            <Bookmark size={18} className={track.isFavorite ? "fill-green-700" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ExploreMusic({ selectedTag }: { selectedTag?: string | null }) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [tracks, setTracks] = useState<ExplorePostDto[]>([]);
  const [trending, setTrending] = useState<{ genres: string[]; tags: string[] }>({ genres: [], tags: [] });
  const [loading, setLoading] = useState(true);
  const [albums, setAlbums] = useState<AlbumForMusic[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const tags = selectedTag ? [selectedTag] : undefined;
        const [musicRes, trendingRes] = await Promise.all([
          postsApi.explore({ category: "Music", tags, pageSize: 20 }),
          feedApi.getTrending(),
        ]);
        setTracks(musicRes.data.items || []);
        let trendingData = trendingRes.data;
        if (Array.isArray(trendingData) && trendingData.length > 0) trendingData = trendingData[0];
        setTrending({ genres: trendingData?.genres ?? [], tags: trendingData?.tags ?? [] });
      } catch (err) {
        console.error(err);
        message.error(t("common.error"));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedTag, t]);

  useEffect(() => {
    const loadAlbums = async () => {
      setLoadingAlbums(true);
      try {
        const res = await collectionsApi.exploreCollections({ sortBy: "newest", pageSize: 10 });
        const all = res.data.items || [];
        const musicAlbums = all.filter(col => col.type === 1).slice(0, 4);
        setAlbums(musicAlbums.map(col => ({ id: col.id, title: col.title, coverUrl: col.coverUrl || "https://placehold.co/168x168", ownerName: col.ownerName })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAlbums(false);
      }
    };
    loadAlbums();
  }, []);

  const handleLike = async (postId: string) => {
    if (!isAuthenticated) { message.warning(t("post.auth_required")); return; }
    const track = tracks.find(t => t.id === postId);
    if (!track) return;
    const wasLiked = track.isLikedByCurrentUser;
    setTracks(prev => prev.map(t => t.id === postId ? { ...t, isLikedByCurrentUser: !wasLiked, likesCount: t.likesCount + (wasLiked ? -1 : 1) } : t));
    try {
      if (wasLiked) await postsApi.unlike(postId, { postId, userId: user!.id });
      else await postsApi.like(postId, { postId, userId: user!.id });
    } catch {
      setTracks(prev => prev.map(t => t.id === postId ? { ...t, isLikedByCurrentUser: wasLiked, likesCount: t.likesCount + (wasLiked ? 1 : -1) } : t));
      message.error(t("post.like_error"));
    }
  };

  const handleFavorite = async (postId: string) => {
    if (!isAuthenticated) { message.warning(t("post.auth_required")); return; }
    const track = tracks.find(t => t.id === postId);
    if (!track) return;
    const wasFav = track.isFavorite;
    setTracks(prev => prev.map(t => t.id === postId ? { ...t, isFavorite: !wasFav } : t));
    try {
      await postsApi.toggleFavorite(postId);
    } catch {
      setTracks(prev => prev.map(t => t.id === postId ? { ...t, isFavorite: wasFav } : t));
      message.error(t("post.bookmark_error"));
    }
  };

  const handleFollow = async (userId: string) => {
    if (!isAuthenticated) { message.warning(t("post.auth_required")); return; }
    const track = tracks.find(t => t.userId === userId);
    if (!track) return;
    const wasFollowing = track.isFollowingAuthor;
    setTracks(prev => prev.map(t => t.userId === userId ? { ...t, isFollowingAuthor: !wasFollowing } : t));
    try {
      if (wasFollowing) await userService.unfollow(userId);
      else await userService.follow(userId);
    } catch {
      setTracks(prev => prev.map(t => t.userId === userId ? { ...t, isFollowingAuthor: wasFollowing } : t));
      message.error(t("profile.follow_error"));
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Spin size="large" /></div>;

  const featured = tracks[0];
  const remaining = tracks.slice(1);

  return (
    <div className="w-full max-w-[1129px] mx-auto px-4">
      {featured && <MusicFeaturedCard song={featured} onLike={handleLike} onFavorite={handleFavorite} onFollow={handleFollow} />}
      {!loadingAlbums && albums.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-[#1B1C1E] mb-4">{t("explore.music.new_albums")}</h2>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {albums.map(album => <AlbumCard key={album.id} album={album} />)}
          </div>
        </div>
      )}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-[#1B1C1E] mb-4">{t("explore.music.latest_songs")}</h2>
        <div className="space-y-4">
          {remaining.map(track => <MusicTrackCard key={track.id} track={track} onLike={handleLike} onFavorite={handleFavorite} />)}
        </div>
      </div>
    </div>
  );
}