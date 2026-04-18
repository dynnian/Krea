// deno-lint-ignore-file
import React, { useEffect, useRef, useState } from "react";
import { Bookmark, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dropdown, Modal, message } from "antd";
import type { MenuProps } from "antd";
import { useAuth } from "../../contexts/AuthContext.tsx";
import { postsApi } from "../../services/postsService.ts";
import { ChevronLeft, MoreHorizontal } from "lucide-react";

export type WriterWork = {
  id: string;
  postId: string;
  title: string;
  coverUrl: string;
  chaptersCount: number;
  genre: string;
  description: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
};

const WriterCard: React.FC<{ work: WriterWork }> = ({ work }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);
  const [showReadMore, setShowReadMore] = useState(false);
  const [liked, setLiked] = useState(work.isLiked);
  const [likesCount, setLikesCount] = useState(work.likesCount);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setLiked(work.isLiked);
    setLikesCount(work.likesCount);
  }, [work.postId, work.isLiked, work.likesCount]);

  const openPostDetail = () => {
    navigate(`/post/${work.postId}`);
  };

  const requireAuth = () => {
    if (!user) {
      message.warning("Debes iniciar sesión para dar like.");
      navigate("/login");
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth() || actionLoading) return;

    setActionLoading(true);
    const wasLiked = liked;

    setLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      if (wasLiked) {
        await postsApi.unlike(work.postId, { postId: work.postId, userId: user!.id });
      } else {
        await postsApi.like(work.postId, { postId: work.postId, userId: user!.id });
      }
    } catch {
      setLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      message.error("No se pudo actualizar el like.");
    } finally {
      setActionLoading(false);
    }
  };
useEffect(() => {
  const el = descriptionRef.current;
  if (!el) return;

  const isOverflowing = el.scrollHeight > el.clientHeight;
  setShowReadMore(isOverflowing);
}, [work.description]);

	return (
		<div className="w-[687px] h-[170px] bg-[#E8F1FC] border border-[#8F8E8A] p-[15px]">
			<div className="flex h-full gap-[22px] items-center">
        <div className="h-full aspect-[2/3] shrink-0 overflow-hidden shadow-[4px_4px_4px_rgba(0,0,0,0.15)]">
          <img
            src={work.coverUrl}
            alt={work.title}
            onClick={openPostDetail}
            className="w-full h-full object-cover cursor-pointer"
          />
				</div>

				<div className=" h-full flex flex-col min-w-0 pb-[4px] pt-[5px] gap-[0px]">
					<div className="flex items-start justify-between gap-[0px]">
            <div className="min-w-0 flex flex-col gap-[0px]">
              <div className="h-full">
                <h3 
                className="text-[20px] leading-[20px] font-bold text-[#1B1C1E] cursor-pointer hover:underline"
                onClick={openPostDetail}
                >
                  {work.title}
                </h3>
              </div>
              
              <div className="-mt-[5px]">
                <p className=" text-[13px] leading-[13px] font-medium text-[#1B1C1E]">
                  {work.chaptersCount} Capítulos
                </p>
              </div>
            </div>

						<span className="pt-[2px] text-[12px] font-medium text-[#1B1C1E] whitespace-nowrap">
							{work.genre}
						</span>
					</div>

					<div className="mt-[0px] h-auto min-w-0">
            <div className="mt-[px] min-w-0">
              <p
                ref={descriptionRef}
                className="text-[11px] leading-[16px] text-justify font-medium text-[#1B1C1E] line-clamp-3 overflow-hidden"
              >
                {work.description}
              {showReadMore && (
                <button
                  type="button"
                  className="inline text-[11px] leading-[14px] font-medium text-[#0B5107] underline underline-offset-2"
                >
                  Leer más...
                </button>
              )}
              </p>
            </div>
          </div>
					<div className="mt-auto pt-[0px] flex items-center gap-3">
						<button
							type="button"
							className="px-[33px] py-[1px] cursor-pointer hover:bg-[#093B05] rounded-full bg-[#0B5107] border border-[#1B1C1E]"
						>
							<span className="text-[11px] font-medium leading-5 text-[#E3E2DE]">
								Leer
							</span>
						</button>

						<button
							type="button"
							className="w-[24px] h-[24px] rounded-full border border-[#0B5107] bg-[#E9FDE8] text-[#0B5107] flex items-center justify-center"
						>
							<Bookmark size={14} />
						</button>

            <button
              type="button"
              onClick={handleLike}
              disabled={actionLoading}
              className="w-[24px] h-[24px] rounded-full border border-[#0B5107] bg-[#E9FDE8] text-[#0B5107] cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              <Heart size={14} className={liked ? "fill-[#0B5107] text-[#0B5107]" : ""} />
            </button>
					</div>
				</div>
			</div>
		</div>
	);
};

export type WriterCollectionPreview = {
  id: string;
  title: string;
  workIds: string[];
  coverUrl: string;
  previewCovers: string[];
};

type WriterPortfolioProps = {
  works?: WriterWork[];
  error?: string | null;
  collections?: WriterCollectionPreview[];
  onEditCollection?: (collectionId: string) => void;
  onDeleteCollection?: (collectionId: string) => void;
};

function getLatestPortfolioBooks(works: WriterWork[]) {
  return works.slice(0, 5);
}


function PortfolioViewHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center gap-[10px] pb-[18px]">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center justify-center w-[32px] h-[32px] hover:bg-gray-200 rounded-full transition cursor-pointer"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="pt-[10px]">
        <h1 className="text-[20px] font-medium text-gray-800 leading-none">
          {title}
        </h1>
      </div>
    </div>
  );
}

function WriterPortfolioGeneralCard({
  works,
  onOpen,
}: {
  works: WriterWork[];
  onOpen: () => void;
}) {
  const latestFiveBooks = getLatestPortfolioBooks(works);

  const firstBook = latestFiveBooks[4];  // más viejo de los 5
  const secondBook = latestFiveBooks[3];
  const thirdBook = latestFiveBooks[2];
  const fourthBook = latestFiveBooks[1];
  const fifthBook = latestFiveBooks[0];  // más reciente (derecha)

  return (
    <div className="w-[287px] text-left bg-transparent ">
      <div className="w-full">
        <div
          className="relative h-[225px] cursor-pointer"
          onClick={onOpen}
        >
          <div className="absolute left-[0px] top-[0px] w-[105px] h-[162px] overflow-hidden shadow-[4px_4px_4px_rgba(0,0,0,0.15)]">
            {firstBook && (
              <img
                src={firstBook.coverUrl}
                alt={firstBook.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="absolute left-[46px] top-[16px] w-[105px] h-[162px] overflow-hidden shadow-[4px_4px_4px_rgba(0,0,0,0.15)]">
            {secondBook && (
              <img
                src={secondBook.coverUrl}
                alt={secondBook.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="absolute left-[91px] top-[32px] w-[105px] h-[162px] overflow-hidden shadow-[4px_4px_4px_rgba(0,0,0,0.15)]">
            {thirdBook && (
              <img
                src={thirdBook.coverUrl}
                alt={thirdBook.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="absolute left-[137px] top-[47px] w-[105px] h-[162px] overflow-hidden shadow-[4px_4px_4px_rgba(0,0,0,0.15)]">
            {fourthBook && (
              <img
                src={fourthBook.coverUrl}
                alt={fourthBook.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="absolute left-[182px] top-[63px] w-[105px] h-[162px] overflow-hidden shadow-[4px_4px_4px_rgba(0,0,0,0.15)]">
            {fifthBook && (
              <img
                src={fifthBook.coverUrl}
                alt={fifthBook.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        <div className="flex items-start justify-between pl-[4px] py-[14px]">
          <div>
            <h3
              className="text-[24px] font-medium leading-[22px] text-[#1B1C1E] cursor-pointer hover:underline"
              onClick={onOpen}
            >
              Portafolio general
            </h3>

            <h3 className="text-[14px] font-medium leading-[14px] text-[#1B1C1E] mt-[8px]">
              {works.length} Obras
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

function WriterCollectionCard({
  collection,
  itemCount,
  onOpen,
  onEdit,
  onDelete,
}: {
  collection: WriterCollectionPreview;
  itemCount: number;
  onOpen: (collectionId: string) => void;
  onEdit: (collectionId: string) => void;
  onDelete: (collectionId: string) => void;
}) {
  const rightTop = collection.previewCovers[2];
  const rightMiddle = collection.previewCovers[1];
  const rightBottom = collection.previewCovers[0];

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
      onEdit(collection.id);
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
          onDelete?.(collection.id);
        },
        okButtonProps: {
          className: "krea-cancel-button",
        },
        cancelButtonProps: {
          className: "krea-white-button",
        },
      });
    }
  };

  return (
    <div className="w-[287px] text-left bg-transparent ">
      <div className="w-full">
        <div
          className="relative h-[225px] cursor-pointer"
          onClick={() => onOpen(collection.id)}
        >
          <div className="absolute left-0 top-0 w-[196px] h-[225px] rounded-[10px] overflow-hidden bg-[#D9D9D9] shadow-[4px_4px_13px_rgba(0,0,0,0.25)]">
            <img
              src={collection.coverUrl}
              alt={collection.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute right-[0px] top-[0px] w-[69px] h-[107px] rounded-[0px] overflow-hidden bg-[#D9D9D9] shadow-[4px_4px_8px_rgba(0,0,0,0.18)]">
            {rightTop && (
              <img
                src={rightTop}
                alt={collection.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="absolute right-[7px] top-[59px] w-[69px] h-[107px] rounded-[0px] overflow-hidden bg-[#D9D9D9] shadow-[4px_4px_8px_rgba(0,0,0,0.18)]">
            {rightMiddle && (
              <img
                src={rightMiddle}
                alt={collection.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="absolute right-[14px] top-[118px] w-[69px] h-[107px] rounded-[0px] overflow-hidden bg-[#D9D9D9] shadow-[4px_4px_8px_rgba(0,0,0,0.18)]">
            {rightBottom && (
              <img
                src={rightBottom}
                alt={collection.title}
                className="w-full h-full object-cover"
              />
            )}
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
              {itemCount} Obras
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
              <MoreHorizontal size={16} />
            </button>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}

function WriterPortfolioWorksGrid({ works }: { works: WriterWork[] }) {
  const leftColumn = works.filter((_, index) => index % 2 === 0);
  const rightColumn = works.filter((_, index) => index % 2 !== 0);

  return (
    <div className="w-full max-w-[1388px] mx-auto">
      {works.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[14px]">
          <div className="flex flex-col gap-[14px]">
            {leftColumn.map((work) => (
              <WriterCard key={work.id} work={work} />
            ))}
          </div>

          <div className="flex flex-col gap-[14px]">
            {rightColumn.map((work) => (
              <WriterCard key={work.id} work={work} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No hay obras literarias disponibles.
        </div>
      )}
    </div>
  );
}

export default function WriterPortfolio({
  works = [],
  error = null,
  collections = [],
  onEditCollection,
  onDeleteCollection,
}: WriterPortfolioProps) {
  const [showGeneralPortfolio, setShowGeneralPortfolio] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

  const activeCollection = collections.find(
    (collection) => collection.id === activeCollectionId
  );

  const handleEditCollection = (collectionId: string) => {
    onEditCollection?.(collectionId);
  };

  const handleDeleteCollection = (collectionId: string) => {
    onDeleteCollection?.(collectionId);
  };

  const filteredCollectionWorks = activeCollection
    ? works.filter((work) => activeCollection.workIds.includes(work.id))
    : [];

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  if (showGeneralPortfolio) {
    return (
      <div className="w-full -mt-[60px]">
        <div className="max-w-[1388px] mx-auto">
          <PortfolioViewHeader
            title="Portafolio General"
            onBack={() => setShowGeneralPortfolio(false)}
          />
        </div>

        <WriterPortfolioWorksGrid works={works} />
      </div>
    );
  }

  if (activeCollection) {
    return (
      <div className="w-full -mt-[60px]">
        <div className="max-w-[1388px] mx-auto">
          <PortfolioViewHeader
            title={activeCollection.title}
            onBack={() => setActiveCollectionId(null)}
          />
        </div>

        <WriterPortfolioWorksGrid works={filteredCollectionWorks} />
      </div>
    );
  }

  if (collections.length === 0) {
    return <WriterPortfolioWorksGrid works={works} />;
  }

  return (
    <div className="w-full px-[20px] md:px-[241px] pb-[30px]">
      <div className="grid justify-center gap-x-[35px] gap-y-[20px] [grid-template-columns:repeat(auto-fit,320px)]">
        <WriterPortfolioGeneralCard
          works={works}
          onOpen={() => setShowGeneralPortfolio(true)}
        />

      {collections.map((collection) => (
        <WriterCollectionCard
          key={collection.id}
          collection={collection}
          itemCount={collection.workIds.length}
          onOpen={setActiveCollectionId}
          onEdit={handleEditCollection}
          onDelete={handleDeleteCollection}
        />
      ))}
      </div>
    </div>
  );
}