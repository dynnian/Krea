// components/Explore/ExploreImages.tsx
import React, { useEffect, useState, useState } from "react";
import { Spin, message } from "antd";
import { Link } from "react-router-dom";
import { postsApi } from "../../services/postsService";
import type { ExplorePostDto, PostDto } from "../../types/api";

interface ExploreImagesProps {
  selectedTag?: string | null;
  selectedArtist?: string | null;
}

export default function ExploreImages({ selectedTag, selectedArtist }: ExploreImagesProps) {
  const [images, setImages] = useState<ExplorePostDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const tags = selectedTag ? [selectedTag] : undefined;
        const response = await postsApi.explore({
          category: "Image",
          tags,
          pageSize: 30,
        });
        const response = await postsApi.explore({ category: "Image", tags, pageSize: 30 });
        setImages(response.data.items || []);
      } catch (error) {
        console.error(error);
        message.error("Error loading images");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [selectedTag, selectedArtist]);

  if (loading) return <div className="flex justify-center p-20"><Spin size="large" /></div>;

  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] px-4">
      <div className="columns-2 md:columns-4 lg:columns-5 gap-4 space-y-4">
        {images.map((post) => (
          <div key={post.id} className="break-inside-avoid overflow-hidden rounded-lg group cursor-pointer">
            <Link to={`/post/${post.id}`}>
              <img
                src={post.media?.[0]?.url || "https://placehold.co/400x400?text=No+image"}
                alt={post.title}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <div className="mt-2 px-1">
              <Link to={`/user/${post.author.id}`} className="text-sm font-bold truncate hover:underline">
                {post.title}
              </Link>
              <Link to={`/user/${post.author.id}`} className="text-xs text-gray-600 block hover:underline">
                @{post.author.username}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}