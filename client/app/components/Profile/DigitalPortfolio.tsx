// deno-lint-ignore-file
import React, { useState } from "react";
import { Dropdown, Modal, message } from "antd";
import type { MenuProps } from "antd";
import { ChevronLeft, MoreHorizontal } from "lucide-react";
import {
  mockImageCollections,
  type MockImageCollection,
} from "../../data/mockImageCollections.ts";

export type DigitalArtwork = {
  id: string;
  title: string;
  imageUrl: string;
};

type DigitalPortfolioProps = {
  items: DigitalArtwork[];
  onEditCollection: (collection: MockImageCollection) => void;
};

type PreviewImage = {
  id: string;
  title: string;
  imageUrl: string;
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

function ImageCollectionCard({ collection, onOpen, onEdit, onDelete, }: {
  collection: MockImageCollection;
  onOpen: (collection: MockImageCollection) => void;
  onEdit: (collection: MockImageCollection) => void;
  onDelete: (collectionId: string) => void;
}) {
  const latestImages = getLatestCollectionImages(collection);
  const rightTopImage = latestImages[0];
  const rightBottomImage = latestImages[1];
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

const handleCollectionMenuClick: MenuProps["onClick"] = ({ key }) => {
  if (key === "edit") {
    console.log("menu edit clicked", collection);
    onEdit(collection);
    return;
  }

  if (key === "delete") {
    Modal.confirm({
      title: "¿Eliminar colección?",
      content: "Esta acción no se puede deshacer.",
      okText: "Eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      // className: "[&_.ant-modal-content]:bg-[#000000]",
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
<button
  type="button"
  className="w-[320px] text-left bg-transparent"
 
>
      <div className="w-full">
        <div 
        className="flex gap-[3px] h-[225px] rounded-[10px] overflow-hidden cursor-pointer"
        onClick={() => onOpen(collection)}
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
          <div className="flex flex-col">
            <h3 
            className="text-[24px] font-medium leading-[22px] text-[#1B1C1E] cursor-pointer hover:underline"
            onClick={() => onOpen(collection)}
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
    </button>
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

export default function DigitalPortfolio({ items, onEditCollection }: DigitalPortfolioProps) {
  const USE_COLLECTIONS_MOCK = true;
  const [collections, setCollections] = useState<MockImageCollection[]>(
    USE_COLLECTIONS_MOCK ? mockImageCollections : []
);
const [showGeneralPortfolio, setShowGeneralPortfolio] = useState(false);
const [activeCollection, setActiveCollection] = useState<MockImageCollection | null>(null);

if (items.length === 0) {
  return (
    <div className="text-center text-gray-500 py-8">
      No hay obras visuales disponibles.
    </div>
  );
}

  const handleEditCollection = (collection: MockImageCollection) => {
    console.log("DigitalPortfolio handleEditCollection", collection);
    onEditCollection(collection);
  };
  
  const handleDeleteCollection = (collectionId: string) => {
    setCollections((prev) => prev.filter((collection) => collection.id !== collectionId));
    message.success("Colección eliminada.");
  };

  const handleOpenCollection = (collection: MockImageCollection) => {
    setActiveCollection(collection);
  };
  

 if (showGeneralPortfolio) {
  return (
    <div className="w-full -mt-[60px] AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA">
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
    <div className="w-full -mt-[60px] AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA">
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
    <div className="w-full px-[20px] md:px-[100px] pb-[30px]">
      <div className="grid justify-center gap-x-[35px] gap-y-[20px] [grid-template-columns:repeat(auto-fit,320px)]">
        <PortfolioGeneralCard
          items={items}
          onOpen={() => setShowGeneralPortfolio(true)}
        />

        {collections.map((collection) => (
          <ImageCollectionCard
            key={collection.id}
            collection={collection}
            onOpen={handleOpenCollection}
            onEdit={handleEditCollection}
            onDelete={handleDeleteCollection}
          />
        ))}
      </div>
    </div>
  );
}