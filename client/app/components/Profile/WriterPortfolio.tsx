// deno-lint-ignore-file
import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Bookmark, Heart } from "lucide-react";
import { useNavigate } from "react-router";
import { Dropdown, Modal, message } from "antd";
import type { MenuProps } from "antd";
import { useAuth } from "../../contexts/AuthContext.tsx";
import { postsApi } from "../../services/postsService.ts";
import { ChevronLeft, MoreHorizontal } from "lucide-react";
import LiteratureCover from "../LiteratureCover.tsx";



export type WriterWork = {
  id: string;
  postId: string;
  title: string;
  coverUrl?: string | null;
  documentUrl?: string | null;
  mimeType?: string | null;
  chaptersCount: number;
  genre: string;
  description: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  isBookmarked?: boolean;
};

function isPdfWork(work: Pick<WriterWork, "mimeType" | "documentUrl">) {
  return (
    work.mimeType?.toLowerCase().includes("pdf") ||
    work.documentUrl?.toLowerCase().endsWith(".pdf")
  );
}

function BookCoverFallback({ title }: { title: string }) {
  return (
    <div className="w-full h-full bg-[#D9D9D9] flex items-center justify-center">
      <span className="text-[#8F8E8A] text-[24px] font-bold">
        Libro
      </span>
    </div>
  );
}

function PdfCoverPreview({
  pdfUrl,
  title,
}: {
  pdfUrl: string;
  title: string;
}) {
  return (
    <div className="w-full h-full bg-white flex items-center justify-center overflow-hidden">
      <Document
        file={pdfUrl}
        loading={<BookCoverFallback title={title} />}
        error={<BookCoverFallback title={title} />}
      >
        <Page
          pageNumber={1}
          width={110}
          renderAnnotationLayer={false}
          renderTextLayer={false}
        />
      </Document>
    </div>
  );
}

function WorkCover({
  work,
  className = "",
  onClick,
}: {
  work: WriterWork;
  className?: string;
  onClick?: () => void;
}) {
  const isPlaceholderCover =
    work.coverUrl?.includes("placehold.co") ||
    work.coverUrl?.includes("text=Libro");

  const hasCover = Boolean(
    work.coverUrl &&
      work.coverUrl.trim().length > 0 &&
      !isPlaceholderCover
  );

  const canUsePdfCover = !hasCover && isPdfWork(work) && Boolean(work.documentUrl);

  return (
    <div
      onClick={onClick}
      className={`w-full h-full overflow-hidden bg-[#D9D9D9] ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {hasCover ? (
        <img
          src={work.coverUrl!}
          alt={work.title}
          className="w-full h-full object-cover"
        />
      ) : canUsePdfCover ? (
        <PdfCoverPreview pdfUrl={work.documentUrl!} title={work.title} />
      ) : (
        <BookCoverFallback title={work.title} />
      )}
    </div>
  );
}

const WriterCard: React.FC<{ work: WriterWork }> = ({ work }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);
  const [showReadMore, setShowReadMore] = useState(false);
  const [liked, setLiked] = useState(work.isLiked);
  const [likesCount, setLikesCount] = useState(work.likesCount);
  const [actionLoading, setActionLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(work.isBookmarked ?? false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);


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

  const handleBookmark = async () => {
    if (!requireAuth() || bookmarkLoading) return;

    setBookmarkLoading(true);
    const wasBookmarked = bookmarked;
    setBookmarked(!wasBookmarked);

    try {
      await postsApi.toggleFavorite(work.postId);
    } catch {
      setBookmarked(wasBookmarked);
      message.error("No se pudo actualizar el guardado.");
    } finally {
      setBookmarkLoading(false);
    }
  };

useEffect(() => {
  const el = descriptionRef.current;
  if (!el) return;

  const isOverflowing = el.scrollHeight > el.clientHeight;
  setShowReadMore(isOverflowing);
}, [work.description]);

	return (
    <div className="w-full min-h-[170px] bg-[#E8F1FC] border border-[#8F8E8A] p-[14px] ">
      <div className="flex h-full gap-3 sm:gap-[22px] items-start">
        <div className="self-stretch h-auto aspect-[2/3] shrink-0 max-w-[110px] overflow-hidden shadow-[4px_4px_4px_rgba(0,0,0,0.15)]">
          <WorkCover
            work={work}
            onClick={openPostDetail}
          />
        </div>
				<div className="flex-1 h-full flex flex-col min-w-0 pb-[4px] pt-[2px] sm:pt-[5px] gap-0">
					<div className="flex items-start justify-between gap-[0px]">
            <div className="min-w-0 flex flex-col gap-[0px]">
              <div className="h-full">
                <h3 
                  className="text-[22px] sm:text-[24px] leading-[22px] sm:leading-[24px] font-bold text-[#1B1C1E] cursor-pointer hover:underline truncate max-w-full"
                  onClick={openPostDetail}
                  title={work.title}
                >
                  {work.title}
                </h3>
              </div>
              
              <div className="-mt-[5px]">
                <p className="text-[13px] sm:text-[14px] leading-[14px] sm:leading-[15px] font-medium text-[#1B1C1E]">
                  {work.chaptersCount} Capítulos
                </p>
              </div>
            </div>

						<span className="pt-[2px] text-[12px] sm:text-[13px] font-medium text-[#1B1C1E] whitespace-nowrap shrink-0 pl-2">
							{work.genre}
						</span>
					</div>

          <div className="mt-[0px] min-w-0 h-[48px] sm:h-[54px]">
            <div className="min-w-0 h-full">
              <p
                ref={descriptionRef}
                className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-justify font-medium text-[#1B1C1E] line-clamp-2 sm:line-clamp-3 overflow-hidden"
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
					<div className="mt-auto pt-[6px] flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/read/${work.postId}`)}
              className="px-[36px] py-[4px] cursor-pointer hover:bg-[#093B05] rounded-full bg-[#0B5107] border border-[#1B1C1E]"
            >
              <span className="text-[13px] font-medium leading-5 text-[#E3E2DE]">
                Leer
              </span>
            </button>

            <button
              type="button"
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              className="w-[30px] h-[30px] rounded-full border border-[#0B5107] bg-[#E9FDE8] text-[#0B5107] flex items-center justify-center disabled:opacity-50"
            >
              <Bookmark
                size={16}
                className={bookmarked ? "fill-[#0B5107] text-[#0B5107]" : ""}
              />
            </button>

            <button
              type="button"
              onClick={handleLike}
              disabled={actionLoading}
              className="w-[30px] h-[30px] rounded-full border border-[#0B5107] bg-[#E9FDE8] text-[#0B5107] cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              <Heart size={16} className={liked ? "fill-[#0B5107] text-[#0B5107]" : ""} />
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
  readOnly?: boolean;
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
            {firstBook && <WorkCover work={firstBook} />}
          </div>

          <div className="absolute left-[46px] top-[16px] w-[105px] h-[162px] overflow-hidden shadow-[4px_4px_4px_rgba(0,0,0,0.15)]">
            {secondBook && <WorkCover work={secondBook} />}
          </div>

          <div className="absolute left-[91px] top-[32px] w-[105px] h-[162px] overflow-hidden shadow-[4px_4px_4px_rgba(0,0,0,0.15)]">
            {thirdBook && <WorkCover work={thirdBook} />}
          </div>

          <div className="absolute left-[137px] top-[47px] w-[105px] h-[162px] overflow-hidden shadow-[4px_4px_4px_rgba(0,0,0,0.15)]">
            {fourthBook && <WorkCover work={fourthBook} />}
          </div>

          <div className="absolute left-[182px] top-[63px] w-[105px] h-[162px] overflow-hidden shadow-[4px_4px_4px_rgba(0,0,0,0.15)]">
            {fifthBook && <WorkCover work={fifthBook} />}
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
  collectionWorks,
  onOpen,
  onEdit,
  onDelete,
  readOnly = false,
}: {
  collection: WriterCollectionPreview;
  itemCount: number;
  collectionWorks: WriterWork[];
  onOpen: (collectionId: string) => void;
  onEdit: (collectionId: string) => void;
  onDelete: (collectionId: string) => void;
  readOnly?: boolean;
}) {
  const previewWorks = collectionWorks.slice(0, 3);

  const rightTopWork = previewWorks[2];
  const rightMiddleWork = previewWorks[1];
  const rightBottomWork = previewWorks[0];

  const mainCoverWork = collectionWorks[0];

  const hasCollectionCover =
    collection.coverUrl &&
    collection.coverUrl.trim().length > 0 &&
    !collection.coverUrl.includes("placehold.co") &&
    !collection.coverUrl.includes("text=Libro");

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
            {hasCollectionCover ? (
              <img
                src={collection.coverUrl}
                alt={collection.title}
                className="w-full h-full object-cover"
              />
            ) : mainCoverWork ? (
              <LiteratureCover
                title={mainCoverWork.title}
                coverUrl={mainCoverWork.coverUrl}
                documentUrl={mainCoverWork.documentUrl}
                mimeType={mainCoverWork.mimeType}
                width={196}
              />
            ) : null}
          </div>

          <div className="absolute right-[0px] top-[0px] w-[69px] h-[107px] rounded-[0px] overflow-hidden bg-[#D9D9D9] shadow-[4px_4px_8px_rgba(0,0,0,0.18)]">
            {rightTopWork && (
              <LiteratureCover
                title={rightTopWork.title}
                coverUrl={rightTopWork.coverUrl}
                documentUrl={rightTopWork.documentUrl}
                mimeType={rightTopWork.mimeType}
                width={69}
              />
            )}
          </div>

          <div className="absolute right-[7px] top-[59px] w-[69px] h-[107px] rounded-[0px] overflow-hidden bg-[#D9D9D9] shadow-[4px_4px_8px_rgba(0,0,0,0.18)]">
            {rightMiddleWork && (
              <LiteratureCover
                title={rightMiddleWork.title}
                coverUrl={rightMiddleWork.coverUrl}
                documentUrl={rightMiddleWork.documentUrl}
                mimeType={rightMiddleWork.mimeType}
                width={69}
              />
            )}
          </div>

          <div className="absolute right-[14px] top-[118px] w-[69px] h-[107px] rounded-[0px] overflow-hidden bg-[#D9D9D9] shadow-[4px_4px_8px_rgba(0,0,0,0.18)]">
            {rightBottomWork && (
              <LiteratureCover
                title={rightBottomWork.title}
                coverUrl={rightBottomWork.coverUrl}
                documentUrl={rightBottomWork.documentUrl}
                mimeType={rightBottomWork.mimeType}
                width={69}
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
          {!readOnly && (
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
          )}
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
  readOnly = false,
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
      <div className="w-full md:-mt-[60px]">
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
      <div className="w-full md:-mt-[60px]">
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

        {collections.map((collection) => {
          const collectionWorks = works.filter((work) =>
            collection.workIds.includes(work.id)
          );

          return (
            <WriterCollectionCard
              key={collection.id}
              collection={collection}
              itemCount={collection.workIds.length}
              collectionWorks={collectionWorks}
              onOpen={setActiveCollectionId}
              onEdit={handleEditCollection}
              onDelete={handleDeleteCollection}
              readOnly={readOnly}
            />
          );
        })}
      </div>
    </div>
  );
}