import React, { useMemo, useState } from "react";
import { Tabs } from "antd";
import { Bookmark, Heart, Play, Repeat2 } from "lucide-react";
import AudioWaveform from "../WaveSurfer/AudioWaveform";
import {
  musicAlbumsMock,
  musicSongsMock,
  type MusicAlbum,
  type MusicSong,
} from "../../data/musicPortfolioMock";

type MusicPortfolioProps = {
  initialTab?: "songs" | "albums";
};



const SongCard: React.FC<{ song: MusicSong }> = ({ song }) => {
  return (
    <div className="w-full bg-[#E8F1FC] border border-[#8F8E8A] rounded-[10px] shadow-[4px_4px_4px_rgba(0,0,0,0.15)] p-5">
      <div className="flex gap-4 items-start">
        <img
          src={song.coverUrl}
          alt={song.title}
          className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] object-cover rounded"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="text-2xl font-medium text-[#1B1C1E]">
              {song.title}
            </h3>
            <span className="text-sm text-[#1B1C1E] whitespace-nowrap">
              {song.genre}
            </span>
          </div>

          <div className="mt-2">
            <AudioWaveform audioUrl={song.audioUrl} />
          </div>

          <div className="flex items-center justify-center gap-5 mt-4 text-[#0B5107]">
            <button
              type="button"
              className="w-10 h-10 rounded-full border border-[#1B1C1E] bg-[#E9FDE8] flex items-center justify-center">
              <Heart size={18} />
            </button>

            <button
              type="button"
              className="w-10 h-10 rounded-full border border-[#1B1C1E] bg-[#E9FDE8] flex items-center justify-center">
              <Play size={18} />
            </button>

            <button
              type="button"
              className="w-10 h-10 rounded-full border border-[#1B1C1E] bg-[#E9FDE8] flex items-center justify-center">
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

  return (
    <div className="w-full">
      <div className="flex gap-8 items-start">
        <img
          src={album.coverUrl}
          alt={album.title}
          className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] object-cover rounded"
        />

        <div className="flex-1 min-w-0 max-w-[760px]">
          <h3 className="text-4xl font-medium leading-tight text-[#1B1C1E] drop-shadow-sm">
            {album.title}
          </h3>

          <p className="text-2xl text-[#1B1C1E] mt-2">
            {album.releaseDate} · {album.songsCount} Canciones
          </p>

          <div className="mt-6 max-w-[430px]">
            <AudioWaveform audioUrl={album.audioUrl} />
          </div>

          <div className="mt-6 space-y-2 max-w-[520px]">
            {visibleTracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between text-[#1B1C1E]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm">{track.number}</span>
                  <span className="text-sm">·</span>
                  <span className="text-sm">{track.title}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm">{track.duration}</span>
                  <Heart size={16} />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-3 text-sm text-[#1B1C1E] hover:underline"
          >
            Mostrar album entero...
          </button>

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