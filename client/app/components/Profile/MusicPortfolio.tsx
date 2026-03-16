import React, { useMemo, useRef, useState } from "react";
import { Tabs } from "antd";
import { Bookmark, Heart, Play, Pause, Repeat2, ChevronRight } from "lucide-react";
import AudioWaveform from "../WaveSurfer/AudioWaveform";
import {
  musicAlbumsMock,
  musicSongsMock,
  type MusicAlbum,
  type MusicSong,
  type AlbumTrack,
} from "../../data/musicPortfolioMock";

type MusicPortfolioProps = {
  initialTab?: "songs" | "albums";
};

const SongCard: React.FC<{ song: MusicSong }> = ({ song }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaveReady, setIsWaveReady] = useState(false);
  const waveformControls = useRef<{
    playPause: () => void;
    pause: () => void;
  } | null>(null);

  return (
    <div className="w-full h-[240px] bg-[#E8F1FC] border border-[#8F8E8A] rounded-[10px] shadow-[4px_4px_4px_rgba(0,0,0,0.15)] p-5">
      <div className="flex gap-4 items-stretch h-full">
        <img
          src={song.coverUrl}
          alt={song.title}
          className="h-full aspect-square object-cover rounded shadow-[4px_4px_4px_rgba(0,0,0,0.15)]"
        />

        <div className="flex-1 min-w-0">
          <div className="h-[24px]"></div>
          <div className="flex items-start justify-between gap-4 mb-[0px]">
            <h1 className="text-2xl font-medium text-[#1B1C1E]">
              {song.title}
            </h1>
            <span className="text-sm text-[#1B1C1E] whitespace-nowrap">
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
              className="w-10 h-10 rounded-full border cursor-pointer border-[#1B1C1E] bg-[#E9FDE8] flex items-center justify-center"
            >
              <Heart size={18} />
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

const AlbumCard: React.FC<{ album: MusicAlbum }> = ({ album }) => {
  const visibleTracks = useMemo(() => album.tracks.slice(0, 5), [album.tracks]);
  const [selectedTrack, setSelectedTrack] = useState<AlbumTrack>(album.tracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaveReady, setIsWaveReady] = useState(false);

  const waveformControls = useRef<{
    playPause: () => void;
    pause: () => void;
  } | null>(null);

  const handleSelectTrack = (track: AlbumTrack) => {
    const isSameTrack = selectedTrack.id === track.id;

    if (isSameTrack) {
      waveformControls.current?.playPause();
      return;
    }

    setSelectedTrack(track);
    setIsPlaying(false);
    setIsWaveReady(false);
  };

  return (
    <div className="w-full">
      <div className="flex gap-8 items-start">
        <img
          src={album.coverUrl}
          alt={album.title}
          className="w-[180px] h-[180px] md:w-[240px] md:h-[240px] object-cover rounded"
        />

        <div className="flex-1 min-w-0 max-w-[580px]">
          <h3 className="text-4xl font-medium leading-tight text-[#1B1C1E] drop-shadow-sm">
            {album.title}
          </h3>

          <p className="text-2xl text-[#1B1C1E] mt-2">
            {album.releaseDate} · {album.songsCount} Canciones
          </p>

          <div className="mt-6 w-full max-w-full">
            <div className="flex items-center gap-4">
              <button
                type="button"
                disabled={!isWaveReady}
                onClick={() => waveformControls.current?.playPause()}
                className={`w-10 h-10 rounded-full cursor-pointer border border-[#1B1C1E] flex items-center justify-center flex-shrink-0 ${
                  isWaveReady
                    ? "bg-[#E9FDE8] cursor-pointertext-[#0B5107]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <div className="w-full cursor-pointer min-w-0">
                <AudioWaveform
                  audioUrl={selectedTrack.audioUrl}
                  showPlayButton={false}
                  showTime={true}
                  onPlayingChange={setIsPlaying}
                  onReady={(actions) => {
                    waveformControls.current = actions;
                    setIsWaveReady(true);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="mt-13 space-y-2 w-full">
            {visibleTracks.map((track) => {
              const isSelected = selectedTrack.id === track.id;

              return (
                <div
                  key={track.id}
                  className="flex items-center justify-between text-[#1B1C1E]"
                >
                  <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectTrack(track)}
                    className={`w-5 h-5 flex cursor-pointer items-center justify-center transition-colors ${
                      isSelected ? "text-[#0B5107]" : "text-[#1B1C1E]"
                    }`}
                  >
                    {isSelected && isPlaying ? (
                      <Pause size={14} />
                    ) : (
                      <Play size={14} />
                    )}
                  </button>

                    <span className="text-sm">{track.number}</span>
                    <span className="text-sm">·</span>
                    <span className={`text-sm ${isSelected ? "font-medium text-[#0B5107]" : ""}`}>
                      {track.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm">{track.duration}</span>
                    <Heart size={16} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pt-4">
            <button
              type="button"
              className="mt-3 cursor-pointer text-sm text-[#1B1C1E] hover:underline"
            >
              Mostrar album completo...
            </button>
          </div>
          <div className="flex items-center gap-10 mt-5 text-[#1B1C1E]">
            <Repeat2 size={24} />
            <Heart size={24} />
            <Bookmark size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MusicPortfolio({ initialTab = "songs" }: MusicPortfolioProps) {
  const [activeMusicTab, setActiveMusicTab] = useState<"songs" | "albums">(initialTab);

  const musicTabItems = [
    { key: "songs", label: "Canciones" },
    { key: "albums", label: "Álbumes" },
  ];

  return (
    <div className="w-full">
      <div className="krea-tabs mb-6">
        <Tabs
          activeKey={activeMusicTab}
          onChange={(key) => setActiveMusicTab(key as "songs" | "albums")}
          items={musicTabItems}
          centered
          tabBarStyle={{ borderBottom: "none" }}
          tabBarGutter={46}
          size="small"
        />
      </div>

      {activeMusicTab === "songs" && (
        <div className="max-w-[975px] mx-auto space-y-4">
          {musicSongsMock.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}

      {activeMusicTab === "albums" && (
        <div className="max-w-[975px] mx-auto space-y-12">
          {musicAlbumsMock.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}
    </div>
  );
}