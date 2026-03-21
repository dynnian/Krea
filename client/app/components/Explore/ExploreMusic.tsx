import React, { useRef, useState } from "react";
import { Heart, Bookmark, Play, Pause } from "lucide-react";

import AudioWaveform from "../WaveSurfer/AudioWaveform";
import {
  featuredTrackMock,
  newAlbumsMock,
  latestSongsMock,
  trendingGenresMock,
  trendingArtistsMock,
} from "../../data/exploreMusicMock.ts";

interface ExploreMusicProps {
  selectedTag?: string | null;
  selectedArtist?: string | null;
}

export default function ExploreMusic({
  selectedTag,
  selectedArtist,
}: ExploreMusicProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaveReady, setIsWaveReady] = useState(false);

  const waveformControls = useRef<{
    playPause: () => void;
    pause: () => void;
  } | null>(null);

  return (
    <div className="w-full pt-0 items-enter">
      {/* Featured section */}
      <section className="w-full h-[350px] bg-[#E8F1FC] border border-[#8F8E8A] px-[94px] pt-[18px] pb-[25px] flex flex-col ">
        
        <div className="shrink-0 pb-[5px]">
          <h2>
            <span className="text-[#1B1C1E] text-[36px] font-bold">
            Destacado
            </span>
          </h2>
        </div>

        <div className="flex-1 min-h-0 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Left side */}
          <div className="flex h-full min-h-0 flex-row gap-6 items-stretch flex-1">
            {/* Cover */}
              <img
                src={featuredTrackMock.coverUrl}
                alt={featuredTrackMock.title}
                className="h-full aspect-square object-cover rounded shadow-[4px_4px_4px_rgba(0,0,0,0.15)]"
              />


            {/* Info + waveform + controls */}
            <div className="h-full flex-1 min-w-0">
              <div className="flex flex-row items-start pt-[17px] justify-between gap-6">
                <div className="self-start">
                  <div className="flex items-baseline gap-[23px]">
                    <p className="text-[#6B6B6B] text-[16px] md:text-[18px] leading-none m-0">
                      {featuredTrackMock.artist}
                    </p>

                    <button className="h-[24px] px-[22px] rounded-full border border-[#1B1C1E] bg-[#E8F1FC] hover:bg-[#BFD1EA] cursor-pointer">
                      <span className="text-[#1B1C1E] text-[11px] font-medium leading-none">
                        Seguir
                      </span>
                    </button>
                  </div>     
                  <div className="pb-[10px]">
                    <h3 className="text-[#1B1C1E] text-[30px] font-semibold">
                    {featuredTrackMock.title}
                    </h3>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-row gap-2 self-start">
                  {featuredTrackMock.genres.map((genre) => (
                    <span
                      key={genre}
                      className="inline-flex items-center justify-center h-[26px] px-4 rounded-full border border-[#464749] text-[#464749] text-[11px] font-medium bg-[#E8F1FC]"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-[15px] w-full ">
                {/* Waveform */}
                <div className="w-full relative">
                  <AudioWaveform
                    audioUrl={featuredTrackMock.audioUrl}
                    showPlayButton={false}
                    showTime={true}
                    onPlayingChange={setIsPlaying}
                    onReady={(actions) => {
                      waveformControls.current = actions;
                      setIsWaveReady(true);
                    }}
                    
                  />

                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button className="w-11 h-11 rounded-full border border-[#0B5107] bg-[#E9FDE8] text-[#0B5107] flex items-center justify-center">
                    <Heart size={20} />
                  </button>

                  <button
                    type="button"
                    disabled={!isWaveReady}
                    onClick={() => waveformControls.current?.playPause()}
                    className={`w-11 h-11 rounded-full border flex items-center justify-center ${
                      isWaveReady
                        ? "border-[#0B5107] bg-[#E9FDE8] text-[#0B5107] cursor-pointer"
                        : "border-gray-300 bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                  </button>

                  <button className="w-11 h-11 rounded-full border border-[#0B5107] bg-[#E9FDE8] text-[#0B5107] flex items-center justify-center">
                    <Bookmark size={20} />
                  </button>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* Main content container */}
      <div className="mt-6 flex flex-col lg:flex-row gap-6">
        {/* Left column */}
        <div className="flex-1 min-w-0">
          <div className="min-h-[400px]">
            {/* Aquí luego va:
                - Albumes nuevos
                - Song cards
            */}
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="w-full lg:w-[265px] shrink-0">
          <div className="min-h-[400px]">
            {/* Aquí luego van:
                - Géneros en tendencia
                - Artistas en tendencia
            */}
          </div>
        </aside>
      </div>
    </div>
  );
}