// components/Explore/ExploreSongCard.tsx
import React, { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { Link } from "react-router-dom";
import AudioWaveform from "../WaveSurfer/AudioWaveform";
import type { ExplorePostDto } from "../../types/api.ts";

interface ExploreSongCardProps {
  song: ExplorePostDto;
}

export default function ExploreSongCard({ song }: ExploreSongCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaveReady, setIsWaveReady] = useState(false);
  const waveformControls = useRef<{ playPause: () => void } | null>(null);

  const audioUrl = song.previewUrl; // Directo del DTO
  const coverUrl = song.coverUrl || "https://placehold.co/240x240?text=No+cover";

  if (!audioUrl) {
    return (
      <div className="w-full h-[240px] bg-[#E8F1FC] border border-[#8F8E8A] rounded-[10px] p-[20px] flex items-center justify-center">
        <p className="text-gray-500">Audio no disponible</p>
      </div>
    );
  }

  const handlePlayPause = () => {
    if (isWaveReady) waveformControls.current?.playPause();
  };

  return (
    <div className="w-full h-[240px] bg-[#E8F1FC] border border-[#8F8E8A] rounded-[10px] shadow-[4px_4px_4px_rgba(0,0,0,0.15)] p-[20px]">
      <div className="flex gap-4 items-stretch h-full">
        <Link to={`/post/${song.id}`} className="h-full aspect-square shrink-0">
          <img
            src={coverUrl}
            alt={song.title}
            className="h-full w-full object-cover rounded shadow-[4px_4px_4px_rgba(0,0,0,0.15)]"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <Link to={`/post/${song.id}`} className="text-[30px] font-bold text-[#1B1C1E] hover:underline">
              {song.title}
            </Link>
            <span className="text-[15px] text-[#1B1C1E] whitespace-nowrap">
              {song.genres?.[0] || "Música"}
            </span>
          </div>
          <div className="pb-[18px]">
            <Link to={`/user/${song.userId}`} className="hover:underline cursor-pointer text-[#6B6B6B] text-[20px]">
              @{song.authorUsername}
            </Link>
          </div>
          <div className="px-[35px]">
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
          </div>
          <div className="flex justify-center gap-4 pt-[10px]">
            <button
              type="button"
              onClick={handlePlayPause}
              disabled={!isWaveReady}
              className={`w-11 h-11 rounded-full border flex items-center justify-center ${
                isWaveReady
                  ? "border-[#0B5107] bg-[#E9FDE8] text-[#0B5107] cursor-pointer"
                  : "border-gray-300 bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}