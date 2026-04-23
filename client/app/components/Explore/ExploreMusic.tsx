// components/Explore/ExploreMusic.tsx
import React, { useEffect, useState } from "react";
import { Spin, message } from "antd";
import { Link } from "react-router-dom";
import { postsApi, feedApi } from "../../services/postsService";
import ExploreSongCard from "./ExploreSongCard";
import type { PostDto } from "../../types/api";

interface ExploreMusicProps {
  selectedTag?: string | null;
  selectedArtist?: string | null;
}

export default function ExploreMusic({ selectedTag, selectedArtist }: ExploreMusicProps) {
  const [tracks, setTracks] = useState<PostDto[]>([]);
  const [trending, setTrending] = useState<{ genres: string[]; tags: string[] }>({ genres: [], tags: [] });
  const [loading, setLoading] = useState(true);

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
        setTrending(trendingRes.data);
      } catch (error) {
        console.error(error);
        message.error("Error loading music");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedTag, selectedArtist]);

  if (loading) return <div className="flex justify-center p-20"><Spin size="large" /></div>;

  const featuredTrack = tracks[0];
  const remainingTracks = tracks.slice(1);

  return (
    <div className="w-full flex flex-row gap-8 pt-[30px]">
      <div className="flex-1 flex flex-col gap-6">
        {featuredTrack && (
          <>
            <h2 className="text-[36px] font-bold text-[#1B1C1E]">Destacado</h2>
            <ExploreSongCard song={featuredTrack} />
          </>
        )}
        <h2 className="text-[36px] font-bold text-[#1B1C1E] mt-4">Últimas canciones</h2>
        <div className="grid grid-cols-1 gap-4">
          {remainingTracks.map((track) => (
            <ExploreSongCard key={track.id} song={track} />
          ))}
        </div>
      </div>

      <aside className="w-[300px] shrink-0 flex flex-col gap-6">
        <section className="bg-[#E8F1FC] border border-[#8F8E8A] rounded-[10px] p-5">
          <h4 className="text-[20px] font-bold mb-4">Géneros en tendencia</h4>
          <div className="flex flex-wrap gap-2">
            {trending.genres.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 rounded-full border border-[#464749] text-[12px] bg-white cursor-pointer hover:bg-gray-100"
                onClick={() => (window.location.href = `/explore?tab=music&tag=${encodeURIComponent(genre)}`)}
              >
                {genre}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-[#E8F1FC] border border-[#8F8E8A] rounded-[10px] p-5">
          <h4 className="text-[20px] font-bold mb-4">Tags en tendencia</h4>
          <div className="flex flex-wrap gap-2">
            {trending.tags.map((tag) => (
              <span
                key={tag}
                className="text-[#1351AA] font-medium cursor-pointer hover:underline"
                onClick={() => (window.location.href = `/explore?tab=music&tag=${encodeURIComponent(tag)}`)}
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}