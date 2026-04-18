// deno-lint-ignore-file
import React, { useEffect, useState } from "react";
import { Dropdown, Modal, message } from "antd";
import type { MenuProps } from "antd";
import { ChevronLeft, MoreHorizontal } from "lucide-react";
import type { MockImageCollection } from "../../data/mockImageCollections.ts";
import {
  collectionsApi,
  type CollectionDetailDto,
  type UserCollectionDto,
} from "../../services/collectionsService.ts";

export type DigitalArtwork = {
  id: string;
  title: string;
  imageUrl: string;
};

type DigitalPortfolioProps = {
  userId: string;
  items: DigitalArtwork[];
  onEditCollection: (
    collection: MockImageCollection,
    moveTargets: { id: string; title: string; coverUrl?: string }[]
  ) => void;
};

type PreviewImage = {
  id: string;
  title: string;
  imageUrl: string;
};

type ImageCollectionCardData = {
  id: string;
  title: string;
  itemCount: number;
  coverUrl: string | null;
  previewPosts?: PreviewImage[];
};

function getPortfolioGeneralImages(items: DigitalArtwork[]): PreviewImage[] {
  return items.slice(0, 3);
}

function getLatestCollectionImages(collection: MockImageCollection): PreviewImage[] {
  if (!collection.posts?.length) return [];

  const sortedPosts = [...collection.posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return sortedPosts.slice(0, 2);
}

function mapCollectionPostsToDigitalArtwork(
  collection: MockImageCollection,
): DigitalArtwork[] {
  return collection.posts.map((post) => ({
    id: post.id,
    title: post.title,
    imageUrl: post.imageUrl,
  }));
}

function PortfolioGeneralCard({ items, onOpen,}: {
  items: DigitalArtwork[];
  onOpen: () => void;
}){
  const previewImages = getPortfolioGeneralImages(items);
  const mainImage = previewImages[0];
  const rightTopImage = previewImages[1];
  const rightBottomImage = previewImages[2];
  
return (
  <div className="w-[320px] text-left bg-transparent">
      <div className="w-full">
          <div 
            className="flex gap-[3px] h-[225px] rounded-[10px] overflow-hidden cursor-pointer"
            onClick={onOpen}
          >
          
          <div className="w-[58%] h-full bg-[#D9D9D9] shadow-[4px_4px_13px_rgba(0,0,0,0.25)]">
            {mainImage ? (
              <img
                src={mainImage.imageUrl}
                alt={mainImage.title}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>

          <div className="w-[42%] h-full flex flex-col gap-[3px]">
            <div className="flex-1 bg-[#D9D9D9] overflow-hidden">
              {rightTopImage ? (
                <img
                  src={rightTopImage.imageUrl}
                  alt={rightTopImage.title}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>

            <div className="flex-1 bg-[#D9D9D9] overflow-hidden">
              {rightBottomImage ? (
                <img
                  src={rightBottomImage.imageUrl}
                  alt={rightBottomImage.title}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between pl-[4px] py-[14px]">
          <div>
            <h3 
              className="text-[24px] font-medium leading-[22px] text-[#1B1C1E] cursor-pointer hover:underline"
              onClick={onOpen}
            >
              Portafolio General
            </h3>
            <h3 className="text-[14px] font-medium leading-[14px] text-[#1B1C1E] mt-[8px]">
              {items.length} Obras
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageCollectionCard({ collection, items, onOpen, onEdit, onDelete, }: {
  collection: ImageCollectionCardData;
  items: DigitalArtwork[];
  onOpen: (collectionId: string) => void;
  onEdit: (collection: MockImageCollection) => void;
  onDelete: (collectionId: string) => void;
}) {
  const rightTop = collection.previewPosts?.[0];
  const rightBottom = collection.previewPosts?.[1];

  const collectionMenuItems: MenuProps["items"] = [
  {
    key: "edit",
    label: "Editar colección",
  },
  {
    key: "delete",
    label: "Eliminar colección",
    danger: true,
  },
];

const handleCollectionMenuClick: MenuProps["onClick"] = async ({ key }) => {
  if (key === "edit") {
    try {
      const detail = await collectionsApi.getCollectionById(collection.id);
      const fullCollection = mapCollectionDetailToMockImageCollection(detail, items);
      onEdit(fullCollection);
    } catch (error) {
      console.error("Error loading collection for edit:", error);
      message.error("No se pudo abrir la colección para editar.");
    }
    return;
  }

  if (key === "delete") {
    Modal.confirm({
      title: "¿Eliminar colección?",
      content: "Esta acción no se puede deshacer.",
      okText: "Eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      centered: true,
      onOk: () => {
        onDelete(collection.id);
      },
      okButtonProps: {
        className: "krea-cancel-button"
      },
      cancelButtonProps: {
        className: "krea-white-button"
      },
    });
  }
};

return (
  <div className="w-[320px] text-left bg-transparent">
      <div className="w-full">
        <div 
        className="flex gap-[3px] h-[225px] rounded-[10px] overflow-hidden cursor-pointer"
        onClick={() => onOpen(collection.id)}
        >
          <div className="w-[58%] h-full bg-[#D9D9D9] overflow-hidden">
            {collection.coverUrl ? (
              <img
                src={collection.coverUrl}
                alt={collection.title}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>

          <div className="w-[42%] h-full flex flex-col gap-[3px]">
            <div className="flex-1 bg-[#D9D9D9] overflow-hidden">
              {rightTop && (
                <img
                  src={rightTop.imageUrl}
                  alt={rightTop.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex-1 bg-[#D9D9D9] overflow-hidden">
              {rightBottom && (
                <img
                  src={rightBottom.imageUrl}
                  alt={rightBottom.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between pl-[4px] py-[14px]">
          <div className="flex flex-col">
            <h3 
            className="text-[24px] font-medium leading-[22px] text-[#1B1C1E] cursor-pointer hover:underline"
            onClick={() => onOpen(collection.id)}
            >
              {collection.title}
            </h3>
            <h3 className="text-[14px] font-medium leading-[14px] text-[#1B1C1E] mt-[8px]">
              {collection.itemCount} Obras
            </h3>
          </div>

          <Dropdown
            menu={{ items: collectionMenuItems, onClick: handleCollectionMenuClick }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <button
              type="button"
              className="h-[20px] w-[20px] flex items-center justify-center rounded-full cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <MoreHorizontal size={16} className="text-[#1B1C1E]" />
            </button>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}

function PortfolioViewHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (   
      <div className="flex items-center gap-[10px] px-[24px] md:px-[34px] pb-[18px]">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-[32px] h-[32px] hover:bg-gray-200 rounded-full transition cursor-pointer"
        >
          <ChevronLeft size={24} className="text-gray-800" />
        </button>
        <div className="pt-[10px]">
          <h1 className="text-[20px] font-medium text-gray-800 leading-none">{title}</h1>
        </div>
      </div>
      
  );
}

function DigitalPortfolioGrid({ items }: { items: DigitalArtwork[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-[1px] px-0 pb-[1px]">
      {items.map((item) => (
        <div
          key={item.id}
          className="aspect-square overflow-hidden bg-white"
        >
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
          />
        </div>
      ))}
    </div>
  );
}

function mapCollectionDetailToMockImageCollection(
  detail: CollectionDetailDto,
  allItems: DigitalArtwork[],
): MockImageCollection {
  const normalizedPosts = detail.posts
    .map((post) => {
      const matchingItem = allItems.find((item) => item.id === post.id);
      const resolvedImageUrl = post.mediaPreviewUrl ?? matchingItem?.imageUrl ?? "";

      if (!resolvedImageUrl) return null;

      return {
        id: post.id,
        title: post.title,
        imageUrl: resolvedImageUrl,
        createdAt: post.uploadedAt,
      };
    })
    .filter((post): post is NonNullable<typeof post> => post !== null);

  return {
    id: detail.id,
    title: detail.title,
    description: detail.description ?? "",
    itemCount: normalizedPosts.length,
    updatedAt: detail.createdAt,
    coverUrl: detail.coverUrl ?? normalizedPosts[0]?.imageUrl ?? null,
    posts: normalizedPosts,
  };
}

function mapUserCollectionToCardData(
  collection: UserCollectionDto,
): ImageCollectionCardData {
  return {
    id: collection.id,
    title: collection.title,
    itemCount: collection.itemCount,
    coverUrl: collection.coverUrl ?? null,
  };
}

export default function DigitalPortfolio({
  userId,
  items,
  onEditCollection,
}: DigitalPortfolioProps) {
const [showGeneralPortfolio, setShowGeneralPortfolio] = useState(false);
const [activeCollection, setActiveCollection] = useState<MockImageCollection | null>(null);
const [collections, setCollections] = useState<ImageCollectionCardData[]>([]);
const [collectionsLoading, setCollectionsLoading] = useState(false);
const [collectionDetailLoading, setCollectionDetailLoading] = useState(false);


useEffect(() => {
  const loadCollections = async () => {
    if (!userId) return;

    try {
      setCollectionsLoading(true);

      const userCollections = await collectionsApi.getUserCollections(userId);
      const imageCollectionSummaries = userCollections.filter(
        (collection) => collection.type === 0
      );

      const baseCollections = imageCollectionSummaries.map(mapUserCollectionToCardData);

      const collectionsWithPreview = await Promise.all(
        baseCollections.map(async (col) => {
          try {
            const detail = await collectionsApi.getCollectionById(col.id);

            const previewPosts = detail.posts
              .map((post) => {
                const matchingItem = items.find((item) => item.id === post.id);
                const resolvedImageUrl = post.mediaPreviewUrl ?? matchingItem?.imageUrl ?? "";

                if (!resolvedImageUrl) return null;

                return {
                  id: post.id,
                  title: post.title,
                  imageUrl: resolvedImageUrl,
                };
              })
              .filter((post): post is PreviewImage => post !== null)
              .slice(0, 2);

            return {
              ...col,
              previewPosts,
            };
          } catch (error) {
            console.error(`Error loading preview for collection ${col.id}:`, error);
            return col;
          }
        })
      );

      setCollections(collectionsWithPreview);
    } catch (error) {
      console.error("Error loading image collections:", error);
      message.error("No se pudieron cargar las colecciones.");
    } finally {
      setCollectionsLoading(false);
    }
  };

  loadCollections();
}, [userId, items]);


if (items.length === 0) {
  return (
    <div className="text-center text-gray-500 py-8">
      No hay obras visuales disponibles.
    </div>
  );
}

if (collectionDetailLoading) {
  return (
    <div className="text-center text-gray-500 py-8">
      Cargando colección...
    </div>
  );
}

  const handleEditCollection = (collection: MockImageCollection) => {
    console.log("DigitalPortfolio handleEditCollection", collection);

    const moveTargets = collections
      .filter((target) => target.id !== collection.id)
      .map((target) => ({
        id: target.id,
        title: target.title,
        coverUrl: target.coverUrl ?? undefined,
      }));

    onEditCollection(collection, moveTargets);
  };
  
  const handleDeleteCollection = async (collectionId: string) => {
    try {
      await collectionsApi.deleteCollection(collectionId);
      setCollections((prev) =>
        prev.filter((collection) => collection.id !== collectionId)
      );
      message.success("Colección eliminada.");
    } catch (error) {
      console.error("Error deleting collection:", error);
      message.error("No se pudo eliminar la colección.");
    }
  };

  const handleOpenCollection = async (collectionId: string) => {
    try {
      setCollectionDetailLoading(true);

      const detail = await collectionsApi.getCollectionById(collectionId);
      const mappedCollection = mapCollectionDetailToMockImageCollection(detail, items);

      setActiveCollection(mappedCollection);
    } catch (error) {
      console.error("Error loading collection detail:", error);
      message.error("No se pudo abrir la colección.");
    } finally {
      setCollectionDetailLoading(false);
    }
  };
    

 if (showGeneralPortfolio) {
  return (
    <div className="w-full md:-mt-[60px]">
      <PortfolioViewHeader
        title="Portafolio General"
        onBack={() => setShowGeneralPortfolio(false)}
      />
      <DigitalPortfolioGrid items={items} />
    </div>
  );
}

if (activeCollection) {
  return (
    <div className="w-full md:-mt-[60px]">
      <PortfolioViewHeader
        title={activeCollection.title}
        onBack={() => setActiveCollection(null)}
      />
      <DigitalPortfolioGrid
        items={mapCollectionPostsToDigitalArtwork(activeCollection)}
      />
    </div>
  );
}

  if (collections.length === 0) {
    return <DigitalPortfolioGrid items={items} />;
  }

  return (
    <div className="w-full px-[20px] md:px-[241px] pb-[30px]">
      <div className="grid justify-center gap-x-[35px] gap-y-[20px] [grid-template-columns:repeat(auto-fit,320px)]">
        <PortfolioGeneralCard
          items={items}
          onOpen={() => setShowGeneralPortfolio(true)}
        />

        {collections.map((collection) => (
          <ImageCollectionCard
            key={collection.id}
            collection={collection}
            items={items}
            onOpen={handleOpenCollection}
            onEdit={handleEditCollection}
            onDelete={handleDeleteCollection}
          />
        ))}
      </div>
    </div>
  );
}