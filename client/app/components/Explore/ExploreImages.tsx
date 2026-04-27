// deno-lint-ignore-file
import React, { useEffect, useState } from "react";
import { Empty, Spin, message } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { postsApi } from "../../services/postsService.ts";
import type { ExplorePostDto } from "../../types/api.ts";

interface ExploreImagesProps {
  selectedTag?: string | null;
  selectedArtist?: string | null;
}

export default function ExploreImages({
  selectedTag,
  selectedArtist,
}: ExploreImagesProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [images, setImages] = useState<ExplorePostDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);

      try {
        const tags = selectedTag ? [selectedTag] : undefined;

        const res = await postsApi.explore({
          category: "Image",
          tags,
          pageSize: 30,
        });

        const items = res.data?.items ?? [];
        setImages(items);
      } catch (err) {
        console.error("Error loading explore images:", err);
        message.error(t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    void fetchImages();
  }, [selectedTag, t]);

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="pb-[1px]">
      {(selectedTag || selectedArtist) && (
        <div className="max-w-[1200px] mx-auto mb-4 text-[#1B1C1E] text-sm px-2 md:px-4">
          {selectedTag && <span>Tag: {selectedTag}</span>}
          {selectedTag && selectedArtist && <span> · </span>}
          {selectedArtist && <span>Artist: {selectedArtist}</span>}
        </div>
      )}

      {images.length === 0 ? (
        <div className="flex justify-center py-20">
          <Empty description="No hay imágenes para mostrar." />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-8 w-full gap-[1px] bg-[#E3E2DE]">
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              className="aspect-square overflow-hidden bg-[#ddd] border-0 p-0 text-left cursor-pointer"
              onClick={() => navigate(`/image-view?image=${img.id}`)}
              aria-label={`Abrir imagen ${img.title ?? ""}`}
            >
              <img
                src={img.previewUrl || "https://placehold.co/400x400?text=Krea"}
                alt={img.title || "Imagen de explore"}
                className="w-full h-full object-cover hover:scale-105 transition duration-200"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}