// deno-lint-ignore-file
import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Check, MoveRight, Trash2 } from "lucide-react";
import { Modal } from "antd";
import MoveElementsModal, { type MoveTargetCollection } from "./MoveElementsModal.tsx";
import type { MockImageCollection } from "../../../data/mockImageCollections.ts";

export type CollectionType = "images" | "literature" | "music";

type CollectionItem = {
  id: string;
  title: string;
  imageUrl: string;
};

type EditCollectionViewProps = {
  collection: MockImageCollection;
  allItems: CollectionItem[];
  onCancel: () => void;
  onSave: (updatedCollection: MockImageCollection) => void;
  collectionType?: CollectionType;
  moveTargets?: MoveTargetCollection[];
};

const COLLECTION_TYPE_CONFIG: Record<
  CollectionType,
  {
    pageTitle: string;
    coverLabel: string;
    titleLabel: string;
    titlePlaceholder: string;
    moveModalLabel: string;
    itemWordSingular: string;
    itemWordPlural: string;
    otherCollectionsLabel: string;
  }
> = {
  images: {
    pageTitle: "Editar colección",
    coverLabel: "Cover de la colección",
    titleLabel: "Titulo de la colección",
    titlePlaceholder: "Titulo de la colección",
    moveModalLabel: "Mover x obras a:",
    itemWordSingular: "obra",
    itemWordPlural: "obras",
    otherCollectionsLabel: "Otras collections",
  },
  literature: {
    pageTitle: "Editar colección",
    coverLabel: "Cover de la colección",
    titleLabel: "Titulo de la colección",
    titlePlaceholder: "Titulo de la colección",
    moveModalLabel: "Mover x obras a:",
    itemWordSingular: "obra",
    itemWordPlural: "obras",
    otherCollectionsLabel: "Otras collections",
  },
  music: {
    pageTitle: "Editar album",
    coverLabel: "Cover de la album",
    titleLabel: "Titulo de la album",
    titlePlaceholder: "Titulo de la album",
    moveModalLabel: "Mover x canciones a:",
    itemWordSingular: "cancion",
    itemWordPlural: "canciones",
    otherCollectionsLabel: "Otras collections",
  },
};

function EditCollectionHeader({
  onBack,
  title,
}: {
  onBack: () => void;
  title: string;
}) {
  return (
    <div className="flex items-center gap-[12px] px-[24px] md:px-[34px] pb-[18px] pt-[10px]">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center justify-center w-[32px] h-[32px] hover:bg-gray-200 rounded-full transition cursor-pointer"
      >
        <ChevronLeft size={26} className="text-[#1B1C1E]" />
      </button>
      <div className="pt-[10px]">
        <h1 className="text-xl font-medium text-gray-800 leading-none">
          {title}
        </h1>
      </div>
    </div>
  );
}

function SelectableArtworkGrid({
  items,
  selectedIds,
  onToggle,
}: {
  items: CollectionItem[];
  selectedIds: string[];
  onToggle: (item: CollectionItem) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-[5px] px-0 pb-[1px]">
      {items.map((item) => {
        const isSelected = selectedIds.includes(item.id);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item)}
            className="relative aspect-square overflow-hidden bg-white group cursor-pointer"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className={`w-full h-full object-cover transition ${
                isSelected ? "opacity-80" : "group-hover:scale-[1.03]"
              }`}
            />
            <div
              className={`absolute inset-0 transition ${
                isSelected
                  ? "bg-[#0B5107]/25"
                  : "bg-transparent group-hover:bg-black/10 group-hover:scale-[1.03]"
              }`}
            />
            <div
              className={`absolute top-[10px] right-[10px] flex items-center justify-center w-[24px] h-[24px] rounded-full border transition ${
                isSelected
                  ? "bg-[#0B5107] border-[#0B5107] text-white"
                  : "bg-white/90 border-[#1B1C1E] text-transparent"
              }`}
            >
              <Check size={14} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PlaceholderGrid({
  message,
}: {
  message: string;
}) {
  return (
    <div className="w-full min-h-[220px] rounded-[12px] border border-dashed border-[#8F8E8A] flex items-center justify-center text-[#5E5E5E] text-[15px]">
      {message}
    </div>
  );
}

export default function EditCollectionView({
  collection,
  allItems,
  onCancel,
  onSave,
  collectionType = "images",
  moveTargets = [],
}: EditCollectionViewProps) {
  const config = COLLECTION_TYPE_CONFIG[collectionType];

  const [title, setTitle] = useState(collection.title);
  const [coverUrl, setCoverUrl] = useState(collection.coverUrl ?? "");
  const [stagedItems, setStagedItems] = useState<CollectionItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveSearch, setMoveSearch] = useState("");
  const [selectedMoveTargetId, setSelectedMoveTargetId] = useState<string | null>(null);

  useEffect(() => {
    setTitle(collection.title);
    setCoverUrl(collection.coverUrl ?? "");

    const normalizedSelected = collection.posts
      .map((post) => ({
        id: post.id,
        title: post.title,
        imageUrl: post.imageUrl,
      }))
      .filter((post) => post.imageUrl);

    setStagedItems(normalizedSelected);
    setSelectedIds([]);
    setIsMoveModalOpen(false);
    setMoveSearch("");
    setSelectedMoveTargetId(null);
  }, [collection]);

  const selectedItems = useMemo(
    () => stagedItems.filter((item) => selectedIds.includes(item.id)),
    [stagedItems, selectedIds],
  );

  const hasSelection = selectedIds.length > 0;

  const isDirty = useMemo(() => {
    const originalIds = collection.posts.map((post) => post.id).join("|");
    const stagedIds = stagedItems.map((item) => item.id).join("|");

    return (
      title.trim() !== collection.title ||
      (coverUrl ?? "") !== (collection.coverUrl ?? "") ||
      originalIds !== stagedIds
    );
  }, [title, coverUrl, stagedItems, collection]);

  const filteredMoveTargets = useMemo(() => {
    const currentTargets = moveTargets.filter((target) => target.id !== collection.id);

    if (!moveSearch.trim()) return currentTargets;

    const query = moveSearch.toLowerCase().trim();

    return currentTargets.filter((target) =>
      target.title.toLowerCase().includes(query)
    );
  }, [moveTargets, collection.id, moveSearch]);

  const handleToggleSelection = (item: CollectionItem) => {
    const exists = selectedIds.includes(item.id);

    if (exists) {
      setSelectedIds((prev) => prev.filter((id) => id !== item.id));
      return;
    }

    setSelectedIds((prev) => [...prev, item.id]);
  };

  const handleChangeCover = () => {
    if (!hasSelection) return;

    const nextCover = selectedItems[0]?.imageUrl ?? "";
    setCoverUrl(nextCover);
  };

  const handleDeleteSelection = () => {
    if (!hasSelection) return;

    Modal.confirm({
      title: "¿Estas seguro?",
      content: "Se eliminarán los elementos seleccionados de esta colección.",
      centered: true,
      okText: "Eliminar",
      cancelText: "Cancelar",
      okButtonProps: {
        className: "krea-cancel-button",
      },
      cancelButtonProps: {
        className: "krea-white-button",
      },
      onOk: () => {
        const remainingItems = stagedItems.filter(
          (item) => !selectedIds.includes(item.id),
        );

        const coverWasDeleted = selectedItems.some(
          (item) => item.imageUrl === coverUrl,
        );

        setStagedItems(remainingItems);
        setSelectedIds([]);

        if (coverWasDeleted) {
          setCoverUrl(remainingItems[0]?.imageUrl ?? "");
        }
      },
    });
  };

  const handleOpenMoveModal = () => {
    if (!hasSelection) return;

    setSelectedMoveTargetId(null);
    setMoveSearch("");
    setIsMoveModalOpen(true);
  };

  const handleConfirmMove = () => {
    if (!selectedMoveTargetId || !hasSelection) return;

    const remainingItems = stagedItems.filter(
      (item) => !selectedIds.includes(item.id),
    );

    const coverWasMoved = selectedItems.some(
      (item) => item.imageUrl === coverUrl,
    );

    setStagedItems(remainingItems);
    setSelectedIds([]);
    setIsMoveModalOpen(false);
    setSelectedMoveTargetId(null);

    if (coverWasMoved) {
      setCoverUrl(remainingItems[0]?.imageUrl ?? "");
    }

    // TODO:
    // Aquí luego conectamos el staged move hacia la colección destino
    // cuando el parent maneje todas las collections al mismo tiempo.
  };

  const buildUpdatedCollection = (): MockImageCollection => {
    return {
      ...collection,
      title: title.trim() || collection.title,
      coverUrl,
      itemCount: stagedItems.length,
      posts: stagedItems.map((item) => {
        const existingPost = collection.posts.find((post) => post.id === item.id);

        return {
          id: item.id,
          title: item.title,
          imageUrl: item.imageUrl,
          createdAt: existingPost?.createdAt ?? new Date().toISOString(),
        };
      }),
    };
  };

  const handleCancel = () => {
    if (!isDirty) {
      onCancel();
      return;
    }

    Modal.confirm({
      title: "¿Estas seguro?",
      content: "Se perderán los cambios no guardados.",
      centered: true,
      okText: "Salir",
      cancelText: "Volver",
      okButtonProps: {
        className: "krea-cancel-button",
      },
      cancelButtonProps: {
        className: "krea-white-button",
      },
      onOk: () => {
        onCancel();
      },
    });
  };

  const handleSave = () => {
    if (!isDirty) {
      onSave(buildUpdatedCollection());
      return;
    }

    Modal.confirm({
      title: "¿Estas seguro?",
      content: "Se guardarán los cambios realizados en esta colección.",
      centered: true,
      okText: "Guardar",
      cancelText: "Cancelar",
      okButtonProps: {
        className: "krea-save-button",
      },
      cancelButtonProps: {
        className: "krea-white-button",
      },
      onOk: () => {
        onSave(buildUpdatedCollection());
      },
    });
  };

  const renderBottomContent = () => {
    if (collectionType === "images") {
      return (
        <SelectableArtworkGrid
          items={stagedItems}
          selectedIds={selectedIds}
          onToggle={handleToggleSelection}
        />
      );
    }

    if (collectionType === "literature") {
      return (
        <PlaceholderGrid message="Vista de literatura pendiente de conectar." />
      );
    }

    if (collectionType === "music") {
      return (
        <PlaceholderGrid message="Vista de música pendiente de conectar." />
      );
    }

    return null;
  };

  return (
    <div className="w-full">
      <EditCollectionHeader
        onBack={handleCancel}
        title={config.pageTitle}
      />

      <div className="px-[24px] md:px-[34px] pb-[24px]">
        <div className="flex flex-col xl:flex-row gap-[28px] xl:gap-[34px]">
          <div className="w-full xl:w-[210px] shrink-0">
            <label className="block text-[18px] font-medium text-[#1B1C1E] mb-[8px]">
              {config.coverLabel}
            </label>

            <div className="w-[216px] h-[216px] rounded-[18px] overflow-hidden bg-[#D9D9D9]">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt="cover"
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
          </div>

          <div className="flex-1">
            <div className="w-full">
              <label className="block text-[18px] font-medium text-[#1B1C1E] mb-[8px]">
                {config.titleLabel}
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={config.titlePlaceholder}
                className="w-full h-[48px] rounded-[10px] border border-[#1B1C1E] bg-[#F3F3F1] px-[14px] text-[15px] text-[#1B1C1E] outline-none"
              />
            </div>

            <div className="mt-[16px]">
              <span className="block text-[14px] font-medium text-[#1B1C1E] mb-[10px]">
                Que hacer con la selección?
              </span>

              <div className="flex items-center gap-[12px]">
                <button
                  type="button"
                  onClick={handleOpenMoveModal}
                  disabled={!hasSelection}
                  className={`h-[34px] rounded-[10px] border px-[14px] flex items-center gap-[8px] text-[13px] font-medium ${
                    hasSelection
                      ? "krea-white-button text-[#1B1C1E] cursor-pointer transition"
                      : "border-[#BDBDBD] bg-[#E8E8E8] text-[#9A9A9A] cursor-not-allowed"
                  }`}
                >
                  <MoveRight size={14} />
                  <span>Mover</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteSelection}
                  disabled={!hasSelection}
                  className={`h-[34px] rounded-[10px] border px-[14px] flex items-center gap-[8px] text-[13px] font-medium ${
                    hasSelection
                      ? "krea-cancel-button text-[#E4544C] cursor-pointer transition"
                      : "border-[#E3B2AF] bg-[#F8F0EF] text-[#D5AAA6] cursor-not-allowed"
                  }`}
                >
                  <Trash2 size={14} />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>

            <div className="flex items-end justify-between gap-[20px] mt-[48px] flex-wrap">
              <button
                type="button"
                onClick={handleChangeCover}
                className="krea-save-button px-5 py-2 rounded-lg border border-[#1B1C1E] font-medium transition"
              >
                Cambiar Cover
              </button>

              <div className="flex items-center gap-[12px]">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="krea-cancel-button px-5 py-2 rounded-lg border border-[#1B1C1E] font-medium transition"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="krea-save-button px-5 py-2 rounded-lg border border-[#1B1C1E] font-medium transition"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[24px]">
          {renderBottomContent()}
        </div>
      </div>

      <MoveElementsModal
        open={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        onSave={handleConfirmMove}
        moveTargets={filteredMoveTargets}
        searchValue={moveSearch}
        onSearchChange={setMoveSearch}
        selectedTargetId={selectedMoveTargetId}
        onSelectTarget={setSelectedMoveTargetId}
        title={config.moveModalLabel}
        otherCollectionsLabel={config.otherCollectionsLabel}
      />
    </div>
  );
}