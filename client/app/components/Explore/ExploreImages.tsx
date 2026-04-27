import React, { useEffect, useState } from "react";
import { Spin, message } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { postsApi } from "../../services/postsService";
import type { ExplorePostDto } from "../../types/api";

interface ExploreImagesProps {
  selectedTag?: string | null;
}

export default function ExploreImages({ selectedTag }: ExploreImagesProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [images, setImages] = useState<ExplorePostDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const tags = selectedTag ? [selectedTag] : undefined;
        const res = await postsApi.explore({ category: "Image", tags, pageSize: 30 });
        setImages(res.data.items || []);
      } catch (err) {
        console.error(err);
        message.error(t("common.error"));
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [selectedTag, t]);

  if (loading) return <div className="flex justify-center p-20"><Spin size="large" /></div>;

  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] px-4 md:px-0">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[1px] bg-[#E3E2DE]">
        {images.map((img) => (
          <div
            key={img.id}
            className="aspect-square overflow-hidden bg-white cursor-pointer"
            onClick={() => navigate(`/image-view?image=${img.id}`)}
          >
            <img
              src={img.previewUrl || "https://placehold.co/400x400"}
              alt={img.title}
              className="w-full h-full object-cover hover:scale-105 transition"
            />
          </div>
        ))}
      </div>
    </div>
  );
}