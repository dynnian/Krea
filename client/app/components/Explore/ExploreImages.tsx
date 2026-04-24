// components/Explore/ExploreImages.tsx
import React, { useEffect, useState } from "react";
import { Spin, message } from "antd";
import { Link } from "react-router-dom";
import { postsApi } from "../../services/postsService";
import type { ExplorePostDto } from "../../types/api";

interface ExploreImagesProps {
  selectedTag?: string | null;
}

export default function ExploreImages({ selectedTag }: ExploreImagesProps) {
  const [images, setImages] = useState<ExplorePostDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const tags = selectedTag ? [selectedTag] : undefined;
        const res = await postsApi.explore({ category: "Image", tags, pageSize: 30 });
        setImages(res.data.items || []);
      } catch (error) {
        console.error(error);
        message.error("Error loading images");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [selectedTag]);

  if (loading) return <div className="flex justify-center p-20"><Spin size="large" /></div>;

  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] px-4">
      <div className="columns-2 md:columns-4 lg:columns-5 gap-4 space-y-4">
        {images.map((img) => (
          <div key={img.id} className="break-inside-avoid overflow-hidden rounded-lg bg-white shadow">
            <Link to={`/post/${img.id}`}>
              <img
                src={img.previewUrl || "https://placehold.co/400x400?text=No+image"}
                alt={img.title}
                className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
              />
            </Link>
            <div className="p-2">
              <Link to={`/post/${img.id}`} className="text-sm font-bold truncate hover:underline block">
                {img.title}
              </Link>
              <Link to={`/user/${img.userId}`} className="text-xs text-gray-600 block hover:underline">
                @{img.authorUsername}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}