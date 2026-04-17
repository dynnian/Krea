// deno-lint-ignore-file
import { useEffect, useRef, useState } from "react";
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

export default function AlbumView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const willowAlbumMock = {
    id: id ?? "mock-willow-album",
    title: "empathogen",
    artist: "WILLOW",
    handle: "@willow",
    year: "2024",
    coverUrl: "https://media.pitchfork.com/photos/663b89c06e00a35534836bf4/master/w_1280%2Cc_limit/Willow-%2520Empathogen.jpeg",
    tracks: [
      {
        id: "track-1",
        postId: "track-1",
        title: "symptom of life",
        audioUrl: "/assets/Album/symptom of life.mp3",
        duration: "2:13",
        likes: 2,
        isLiked: false,
        isBookmarked: false,
      },
      {
        id: "track-2",
        postId: "track-2",
        title: "run!",
        audioUrl: "/assets/Album/run!.mp3",
        duration: "1:30",
        likes: 2,
        isLiked: false,
        isBookmarked: false,
      },
      {
        id: "track-3",
        postId: "track-3",
        title: "home",
        audioUrl: "/assets/Album/home.mp3",
        duration: "3:56",
        likes: 2,
        isLiked: false,
        isBookmarked: false,
      },
      {
        id: "track-4",
        postId: "track-4",
        title: "false self",
        audioUrl: "/assets/Album/false self.mp3",
        duration: "4:13",
        likes: 2,
        isLiked: false,
        isBookmarked: false,
      },
      {
        id: "track-5",
        postId: "track-5",
        title: "pain for fun",
        audioUrl: "/assets/Album/pain for fun.mp3",
        duration: "1:46",
        likes: 2,
        isLiked: false,
        isBookmarked: false,
      },
      {
        id: "track-6",
        postId: "track-6",
        title: "between i and she",
        audioUrl: "/assets/Album/between i and she.mp3",
        duration: "7:21",
        likes: 2,
        isLiked: false,
        isBookmarked: false,
      },
      {
        id: "track-7",
        postId: "track-7",
        title: "no words 1 & 2",
        audioUrl: "/assets/Album/no words 1 & 2.mp3",
        duration: "6:23",
        likes: 2,
        isLiked: false,
        isBookmarked: false,
      },
      {
        id: "track-8",
        postId: "track-8",
        title: "b i g f e e l i n g s",
        audioUrl: "/assets/Album/b i g f e e l i n g s.mp3",
        duration: "6:23",
        likes: 2,
        isLiked: false,
        isBookmarked: false,
      },
      {
        id: "track-9",
        postId: "track-9",
        title: "down",
        audioUrl: "/assets/Album/down.mp3",
        duration: "6:23",
        likes: 2,
        isLiked: false,
        isBookmarked: false,
      },
      {
        id: "track-10",
        postId: "track-10",
        title: "I know that face.",
        audioUrl: "/assets/Album/I know that face..mp3",
        duration: "6:23",
        likes: 2,
        isLiked: false,
        isBookmarked: false,
      },
      {
        id: "track-11",
        postId: "track-11",
        title: "the fear is not real",
        audioUrl: "/assets/Album/the fear is not real.mp3",
        duration: "6:23",
        likes: 2,
        isLiked: false,
        isBookmarked: false,
      },
      {
        id: "track-12",
        postId: "track-12",
        title: "ancient girl",
        audioUrl: "/assets/Album/ancient girl.mp3",
        duration: "6:23",
        likes: 2,
        isLiked: false,
        isBookmarked: false,
      },
    ],
  };

  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [titleFontSize, setTitleFontSize] = useState(80);
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
  const [bookmarkedTrackIds, setBookmarkedTrackIds] = useState<string[]>([]);
  const [shouldAutoplayOnReady, setShouldAutoplayOnReady] = useState(false);

  const waveformControls = useRef<{
    playPause: () => void;
    pause: () => void;
  } | null>(null);

  const titleContainerRef = useRef<HTMLDivElement | null>(null);
  const titleTextRef = useRef<HTMLSpanElement | null>(null);

  const activeTrack = willowAlbumMock.tracks[activeTrackIndex];

  const handlePrevTrack = () => {
    waveformControls.current?.pause();
    setIsPlaying(false);
    setShouldAutoplayOnReady(true);
    setActiveTrackIndex((prev) =>
      prev === 0 ? willowAlbumMock.tracks.length - 1 : prev - 1
    );
  };

  const handleNextTrack = () => {
    waveformControls.current?.pause();
    setIsPlaying(false);
    setShouldAutoplayOnReady(true);
    setActiveTrackIndex((prev) =>
      prev === willowAlbumMock.tracks.length - 1 ? 0 : prev + 1
    );
  };

  const handlePlayPause = () => {
    waveformControls.current?.playPause();
  };

  const handleSelectTrack = (trackIndex: number) => {
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

  const handleToggleLike = (trackId: string) => {
    setLikedTrackIds((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  };

  const handleToggleBookmark = (trackId: string) => {
    setBookmarkedTrackIds((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  };

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
  }, [willowAlbumMock.title]);

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
                src={willowAlbumMock.coverUrl}
                alt={willowAlbumMock.title}
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
                      {willowAlbumMock.title}
                    </span>
                  </div>

                  <p className="text-[18px] lg:text-[24px] leading-[1.2] text-[#6A6A6A]">
                    <button
                      type="button"
                      onClick={() => navigate(`/profile/willow`)}
                      className="cursor-pointer hover:underline"
                    >
                      {willowAlbumMock.artist}
                    </button>
                    {" · "}
                    <button
                      type="button"
                      onClick={() => navigate(`/profile/willow`)}
                      className="cursor-pointer hover:underline"
                    >
                      {willowAlbumMock.handle}
                    </button>
                    {" · "}
                    {willowAlbumMock.year}
                  </p>
                </div>

                <div className="">
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
              {willowAlbumMock.tracks.map((track, index) => {
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
                        onClick={() => handleSelectTrack(index)}
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
                      <span className="whitespace-nowrap">{track.duration}</span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleToggleLike(track.id);
                        }}
                        className="flex items-center justify-center text-[#1B1C1E] cursor-pointer"
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