// deno-lint-ignore-file
import { useEffect, useRef, useState } from "react";
import { message, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Heart,
  Bookmark,
} from "lucide-react";
import AudioWaveform from "../../WaveSurfer/AudioWaveform.tsx";
import { collectionsApi } from "../../../services/collectionsService.ts";
import { userApi } from "../../../services/admin/usersService.ts";
import { postsApi } from "../../../services/postsService.ts";
import WaveSurfer from "wavesurfer.js";
import { useAuth } from "../../../contexts/AuthContext.tsx";

export default function AlbumView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();


const [albumHeaderData, setAlbumHeaderData] = useState<{
  id: string;
  title: string;
  coverUrl: string;
  ownerId: string;
  ownerName: string;
  ownerHandle: string;
  year: string;
} | null>(null);

  const [albumTracks, setAlbumTracks] = useState<
    {
      id: string;
      postId: string;
      title: string;
      audioUrl: string;
      duration: string;
      likes: number;
      isLiked: boolean;
      isBookmarked: boolean;
    }[]
  >([]);

  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [titleFontSize, setTitleFontSize] = useState(80);
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
  const [bookmarkedTrackIds, setBookmarkedTrackIds] = useState<string[]>([]);
  const [shouldAutoplayOnReady, setShouldAutoplayOnReady] = useState(false);
  const [likeLoadingTrackIds, setLikeLoadingTrackIds] = useState<string[]>([]);
  const [isLoadingAlbum, setIsLoadingAlbum] = useState(true);
  const [trackDurationsById, setTrackDurationsById] = useState<Record<string, string>>({});

  const waveformControls = useRef<{
    playPause: () => void;
    pause: () => void;
  } | null>(null);

  const titleContainerRef = useRef<HTMLDivElement | null>(null);
  const titleTextRef = useRef<HTMLSpanElement | null>(null);

  const effectiveTracks = albumTracks;
  const activeTrack = effectiveTracks[activeTrackIndex] ?? null;

  const effectiveAlbumTitle = albumHeaderData?.title ?? "Álbum";
  const effectiveAlbumCoverUrl = albumHeaderData?.coverUrl ?? "";
  const effectiveOwnerName = albumHeaderData?.ownerName ?? "Usuario";
  const effectiveOwnerHandle = albumHeaderData?.ownerHandle ?? "usuario";
  const effectiveAlbumYear = albumHeaderData?.year ?? "";
  const handlePrevTrack = () => {
    if (effectiveTracks.length === 0) return;

    waveformControls.current?.pause();
    setIsPlaying(false);
    setShouldAutoplayOnReady(true);
    setActiveTrackIndex((prev) =>
      prev === 0 ? effectiveTracks.length - 1 : prev - 1
    );
  };

  const handleNextTrack = () => {
    if (effectiveTracks.length === 0) return;

    waveformControls.current?.pause();
    setIsPlaying(false);
    setShouldAutoplayOnReady(true);
    setActiveTrackIndex((prev) =>
      prev === effectiveTracks.length - 1 ? 0 : prev + 1
    );
  };

  const handlePlayPause = () => {
    if (effectiveTracks.length === 0) return;
    waveformControls.current?.playPause();
  };

  const handleSelectTrack = (trackIndex: number) => {
    if (effectiveTracks.length === 0) return;

    if (trackIndex === activeTrackIndex) {
      waveformControls.current?.playPause();
      return;
    }

    waveformControls.current?.pause();
    setIsPlaying(false);
    setShouldAutoplayOnReady(true);
    setActiveTrackIndex(trackIndex);
  };

  const handleOpenTrackPost = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleToggleLike = async (trackId: string) => {
    if (!user) {
      message.warning("Debes iniciar sesión para dar like.");
      navigate("/login");
      return;
    }

    if (likeLoadingTrackIds.includes(trackId)) return;

    const track = albumTracks.find((item) => item.id === trackId);
    if (!track) return;

    const wasLiked = likedTrackIds.includes(trackId);

    setLikeLoadingTrackIds((prev) => [...prev, trackId]);

    setLikedTrackIds((prev) =>
      wasLiked ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );

    setAlbumTracks((prev) =>
      prev.map((item) =>
        item.id === trackId
          ? {
              ...item,
              likes: wasLiked ? Math.max(0, item.likes - 1) : item.likes + 1,
              isLiked: !wasLiked,
            }
          : item
      )
    );

    try {
      if (wasLiked) {
        await postsApi.unlike(track.postId, {
          postId: track.postId,
          userId: user.id,
        });
      } else {
        await postsApi.like(track.postId, {
          postId: track.postId,
          userId: user.id,
        });
      }
    } catch (error) {
      console.error("Error toggling like on track:", error);

      setLikedTrackIds((prev) =>
        wasLiked ? [...prev, trackId] : prev.filter((id) => id !== trackId)
      );

      setAlbumTracks((prev) =>
        prev.map((item) =>
          item.id === trackId
            ? {
                ...item,
                likes: wasLiked ? item.likes + 1 : Math.max(0, item.likes - 1),
                isLiked: wasLiked,
              }
            : item
        )
      );

      message.error("No se pudo actualizar el like de la canción.");
    } finally {
      setLikeLoadingTrackIds((prev) => prev.filter((id) => id !== trackId));
    }
  };

  const handleToggleBookmark = (trackId: string) => {
    setBookmarkedTrackIds((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  };

  const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "--:--";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const getAudioDurationFromWaveSurfer = async (audioUrl: string) => {
  return await new Promise<string>((resolve) => {
    const container = document.createElement("div");

    const wavesurfer = WaveSurfer.create({
      container,
      url: audioUrl,
      height: 0,
      barWidth: 0,
      waveColor: "transparent",
      progressColor: "transparent",
      cursorColor: "transparent",
      interact: false,
    });

    const cleanup = () => {
      try {
        wavesurfer.destroy();
      } catch {
        // ignore
      }
    };

    wavesurfer.on("ready", () => {
      const duration = wavesurfer.getDuration();
      cleanup();
      resolve(formatDuration(duration));
    });

    wavesurfer.on("error", () => {
      cleanup();
      resolve("--:--");
    });
  });
};

  useEffect(() => {
    if (!id) return;

    setIsLoadingAlbum(true);
    setTrackDurationsById({});

    const loadAlbumData = async () => {
      try {
        const collection = await collectionsApi.getCollectionById(id);
        const ownerProfileResponse = await userApi.getProfile(collection.ownerId);
        const ownerProfile = ownerProfileResponse.data;

        setAlbumHeaderData({
          id: collection.id,
          title: collection.title,
          coverUrl: collection.coverUrl ?? "",
          ownerId: collection.ownerId,
          ownerName:
            ownerProfile.displayName ??
            ownerProfile.username ??
            "Usuario",
          ownerHandle:
            ownerProfile.username ??
            "usuario",
          year: collection.createdAt
            ? new Date(collection.createdAt).getFullYear().toString()
            : "",
        });

        const resolvedTrackPosts = await Promise.all(
          collection.posts.map(async (collectionPost) => {
            try {
              const postResponse = await postsApi.getPost(collectionPost.id);
              const post = postResponse.data;

              const audioMedia = post.media?.find(
                (media) =>
                  media.mimeType === "audio/mpeg" ||
                  media.mimeType === "music/mpeg" ||
                  media.mimeType?.startsWith("audio/")
              );

              if (!audioMedia?.url) return null;

              return {
                id: collectionPost.id,
                postId: post.id,
                title: post.title || collectionPost.title || "Sin título",
                audioUrl: audioMedia.url,
                duration: "--:--",
                likes: post.likesCount ?? 0,
                isLiked: post.isLikedByCurrentUser ?? false,
                isBookmarked: false,
              };
            } catch (trackError) {
              console.error("Error loading track post:", collectionPost.id, trackError);
              return null;
            }
          })
        );

        const validTracks = resolvedTrackPosts.filter(
          (track): track is NonNullable<typeof track> => track !== null
        );

        setAlbumTracks(validTracks);
        setLikedTrackIds(
          validTracks.filter((track) => track.isLiked).map((track) => track.id)
        );
        setIsLoadingAlbum(false);
      } catch (error) {
        console.error("Error loading album data:", error);
        setAlbumHeaderData(null);
        setAlbumTracks([]);
        setIsLoadingAlbum(false);
      }
    };

    void loadAlbumData();
  }, [id]);

  useEffect(() => {
  if (albumTracks.length === 0) return;

    setLikedTrackIds(
      albumTracks.filter((track) => track.isLiked).map((track) => track.id)
    );
  }, [albumTracks]);

  useEffect(() => {
    if (albumTracks.length === 0) return;

    let cancelled = false;

    const fillDurations = async () => {
      for (const track of albumTracks) {
        if (trackDurationsById[track.id]) continue;

        const resolvedDuration = await getAudioDurationFromWaveSurfer(track.audioUrl);

        if (cancelled) return;

        setTrackDurationsById((prev) => {
          if (prev[track.id]) return prev;

          return {
            ...prev,
            [track.id]: resolvedDuration,
          };
        });
      }
    };

    void fillDurations();

    return () => {
      cancelled = true;
    };
  }, [albumTracks]);

  useEffect(() => {
    if (activeTrackIndex >= effectiveTracks.length) {
      setActiveTrackIndex(0);
      setIsPlaying(false);
      setShouldAutoplayOnReady(false);
    }
  }, [activeTrackIndex, effectiveTracks.length]);

  useEffect(() => {
    const resizeTitle = () => {
      const container = titleContainerRef.current;
      const text = titleTextRef.current;

      if (!container || !text) return;

      let nextFontSize = 80;
      text.style.fontSize = `${nextFontSize}px`;
      text.style.whiteSpace = "nowrap";

      while (text.scrollWidth > container.clientWidth && nextFontSize > 42) {
        nextFontSize -= 2;
        text.style.fontSize = `${nextFontSize}px`;
      }

      setTitleFontSize(nextFontSize);
    };

    resizeTitle();
    window.addEventListener("resize", resizeTitle);

    return () => {
      window.removeEventListener("resize", resizeTitle);
    };
  }, [effectiveAlbumTitle]);

  if (isLoadingAlbum) {
    return (
      <div className="min-h-screen bg-[#E3E2DE] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E3E2DE]">
      <div className="flex items-center gap-3 my-[11px] mx-auto px-4">
        <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-center w-[32px] h-[32px] hover:bg-gray-200 rounded-full transition cursor-pointer"
        >
        <ChevronLeft size={24} className="text-[#1B1C1E]" />
        </button>

        <div className="pt-[10px]">
          <h1 className="text-xl font-medium text-gray-800 leading-none">
            Album
          </h1>
        </div>
      </div>

      <main className="flex justify-center px-4">
        <div className="w-[1100px]">
          <div className="w-full rounded-[14px] bg-[#E8F1FC] border border-[#95ACCC] shadow-[4px_4px_13px_rgba(0,0,0,0.15)] px-[16px] py-[18px] lg:p-[22px]">
            <div className="flex flex-col gap-[18px] lg:flex-row lg:gap-[34px] lg:items-stretch lg:h-[295px]">
              <img
                src={effectiveAlbumCoverUrl}
                alt={effectiveAlbumTitle}
                className="w-full max-w-[260px]  aspect-square object-cover rounded-[10px] shadow-[4px_4px_13px_rgba(0,0,0,0.25)] shrink-0 mx-auto lg:mx-0 lg:h-full lg:w-auto lg:max-w-none"
              />

              <div className="flex-1 min-w-0 flex flex-col justify-between lg:h-full">
                <div className="flex flex-col justify-between min-w-0">
                  <div ref={titleContainerRef} className="w-full min-w-0 overflow-hidden flex justify-center lg:block">
                    <span
                      ref={titleTextRef}
                      className="block lg:-mmt-1 font-medium text-[#1B1C1E] whitespace-nowrap"
                      style={{ fontSize: `${titleFontSize}px` }}
                    >
                      {effectiveAlbumTitle}
                    </span>
                  </div>

                  <p className="text-[18px] lg:text-[24px] leading-[1.2] text-[#6A6A6A]">
                    <button
                      type="button"
                      onClick={() => navigate(`/profile/${effectiveOwnerHandle}`)}
                      className="cursor-pointer hover:underline"
                    >
                      {effectiveOwnerName}
                    </button>
                    {" · "}
                    <button
                      type="button"
                      onClick={() => navigate(`/profile/${effectiveOwnerHandle}`)}
                      className="cursor-pointer hover:underline"
                    >
                      @{effectiveOwnerHandle}
                    </button>
                    {effectiveAlbumYear ? ` · ${effectiveAlbumYear}` : ""}
                  </p>
                </div>

                <div className="">
                {activeTrack && (
                  <AudioWaveform
                    key={activeTrack.id}
                    audioUrl={activeTrack.audioUrl}
                    showPlayButton={false}
                    showTime={true}
                    onPlayingChange={setIsPlaying}
                    onReady={(actions) => {
                      waveformControls.current = actions;

                      if (shouldAutoplayOnReady) {
                        actions.playPause();
                        setShouldAutoplayOnReady(false);
                      }
                    }}
                  />
                )}
                </div>

                <div className=" flex flex-col items-center mt-[15px] lg:mt-[0px] w-full shrink-0">
                  <div className="flex gap-[20px]">
                  <button
                    type="button"
                    onClick={handlePrevTrack}
                    className="w-[54px] h-[54px] rounded-full border border-[#1B1C1E] bg-[#E9FDE8] flex items-center justify-center text-[#1B1C1E] cursor-pointer transition hover:scale-[1.03]"
                  >
                    <SkipBack size={25} />
                  </button>

                  <button
                    type="button"
                    onClick={handlePlayPause}
                    className="w-[54px] h-[54px] rounded-full border border-[#1B1C1E] bg-[#E9FDE8] flex items-center justify-center text-[#0B5107] cursor-pointer transition hover:scale-[1.03]"
                  >
                    {isPlaying ? <Pause size={25} /> : <Play size={25} />}
                  </button>

                  <button
                    type="button"
                    onClick={handleNextTrack}
                    className="w-[54px] h-[54px] rounded-full border border-[#1B1C1E] bg-[#E9FDE8] flex items-center justify-center text-[#1B1C1E] cursor-pointer transition hover:scale-[1.03]"
                  >
                    <SkipForward size={25} />
                  </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="my-[14px] w-full rounded-[14px] bg-[#E8F1FC] border border-[#95ACCC] shadow-[4px_4px_13px_rgba(0,0,0,0.15)] overflow-hidden ">
            <div className="grid grid-cols-[72px_minmax(0,1fr)_90px_110px] lg:grid-cols-[90px_minmax(0,1fr)_180px_180px] items-center px-[14px] lg:px-[22px] h-[60px] border-b border-[#95ACCC] text-[#1B1C1E] text-[15px] lg:text-[18px] font-medium">              
              <div className="ml-[10px] lg:ml-[30px] flex items-center gap-[14px]">
                <span>#</span>
              </div>

              <div>Título</div>

              <div className="text-center">Me Gusta</div>

              <div className="mr-0 lg:mr-14 text-right">Tiempo</div>
            </div>

            <div className="flex flex-col">
              {effectiveTracks.map((track, index) => {
                const isActive = index === activeTrackIndex;

                return (
                  <div
                    key={track.id}
                    onClick={() => handleSelectTrack(index)}
                    className={`grid grid-cols-[72px_minmax(0,1fr)_90px_110px] lg:grid-cols-[90px_minmax(0,1fr)_180px_180px] items-center px-[14px] lg:px-[22px] min-h-[48px] text-[#1B1C1E] text-[15px] lg:text-[18px] transition cursor-pointer hover:bg-[#d8e6f8] ${
                      isActive ? "bg-[#dce9fa]" : ""
                    }`}                  >
                    <div className="flex items-center gap-[12px]">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleSelectTrack(index);
                        }}
                        className="flex items-center justify-center text-[#1B1C1E] cursor-pointer"
                      >
                        {isActive && isPlaying ? (
                          <Pause size={20} />
                        ) : (
                          <Play size={20} />
                        )}
                      </button>

                      <span>{index + 1}</span>
                      <span>·</span>
                    </div>
                    
                    <div className="min-w-0 overflow-hidden">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleOpenTrackPost(track.postId);
                        }}
                        className="inline-flex max-w-full truncate text-left cursor-pointer hover:underline"
                      >
                        <span className="truncate">{track.title}</span>
                      </button>
                    </div>
                    <div className="text-center">
                      {track.likes}
                    </div>

                    <div className="flex items-center justify-end gap-[8px] lg:gap-[14px]">
                      <span className="whitespace-nowrap">
                        {trackDurationsById[track.id] ?? track.duration ?? "--:--"}
                      </span>
                        <button
                          type="button"
                          disabled={likeLoadingTrackIds.includes(track.id)}
                          onClick={async (event) => {
                            event.stopPropagation();
                            await handleToggleLike(track.id);
                          }}
                          className="flex items-center justify-center text-[#1B1C1E] cursor-pointer disabled:opacity-50"
                        >
                        <Heart
                          size={20}
                          className={
                            likedTrackIds.includes(track.id)
                              ? "fill-[#0B5107] text-[#0B5107]"
                              : ""
                          }
                        />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleToggleBookmark(track.id);
                        }}
                        className="flex items-center justify-center text-[#1B1C1E] cursor-pointer"
                      >
                        <Bookmark
                          size={19}
                          className={
                            bookmarkedTrackIds.includes(track.id)
                              ? "fill-[#0B5107] text-[#0B5107]"
                              : ""
                          }
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}