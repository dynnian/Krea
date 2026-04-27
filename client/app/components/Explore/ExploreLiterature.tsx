// app/components/Explore/ExploreLiterature.tsx
// deno-lint-ignore-file
import React, { useEffect, useState } from "react";
import { Empty, Spin, message } from "antd";
import { Bookmark, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext.tsx";
import { postsApi } from "../../services/postsService.ts";
import { userService } from "../../services/userService.ts";
import type { ExplorePostDto } from "../../types/api.ts";
import LiteratureCover from "../LiteratureCover.tsx";

interface ExploreLiteratureProps {
  selectedTag?: string | null;
  selectedArtist?: string | null;
}

const MOCK_TRENDING_GENRES = [
  "Fantasía",
  "Misterio",
  "Romance",
  "Ciencia ficción",
  "Aventura",
  "Drama",
];

const MOCK_TRENDING_AUTHORS = [
  "Said_lol",
  "InkDreamer",
  "LunaWriter",
  "KreaStories",
  "PixelPoet",
];

  const getBookGenres = (book: ExplorePostDto) => {
    const genres =
      book.genres ??
      (book as any).Genres ??
      (book as any).genreNames ??
      (book as any).GenreNames ??
      [];

    return Array.isArray(genres) ? genres : [];
  };

  const getBookCoverUrl = (book: ExplorePostDto) => {
    return (
      book.coverUrl ||
      (book as any).CoverUrl ||
      (book as any).coverMediaUrl ||
      (book as any).CoverMediaUrl ||
      null
    );
  };

  const getBookDocumentUrl = (book: ExplorePostDto) => {
    return (
      (book as any).documentUrl ||
      (book as any).DocumentUrl ||
      (book as any).mediaUrl ||
      (book as any).MediaUrl ||
      book.previewUrl ||
      (book as any).mediaPreviewUrl ||
      null
    );
  };

  const getBookMimeType = (book: ExplorePostDto) => {
    return (
      (book as any).mimeType ||
      (book as any).MimeType ||
      (book as any).mediaMimeType ||
      (book as any).MediaMimeType ||
      null
    );
  };

const getAuthorName = (book: ExplorePostDto) => {
  return (
    book.authorUsername ||
    (book as any).AuthorUsername ||
    (book as any).authorName ||
    (book as any).AuthorName ||
    "Autor"
  );
};

const getFavoriteState = (book: ExplorePostDto) => {
  return Boolean(
    book.isFavorite ??
      (book as any).isFavoritedByCurrentUser ??
      (book as any).IsFavorite ??
      (book as any).IsFavoritedByCurrentUser
  );
};

function CircleActionButton({
  children,
  onClick,
  ariaLabel,
  size = "md",
}: {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel: string;
  size?: "sm" | "md";
}) {
  const sizeClass =
    size === "sm" ? "w-[24px] h-[24px]" : "w-11 h-11";

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`${sizeClass} rounded-full border cursor-pointer border-[#0B5107] bg-[#E9FDE8] text-[#0B5107] flex items-center justify-center hover:bg-[#DDF6DB] transition`}
    >
      {children}
    </button>
  );
}

function LiteratureFeaturedCard({
  book,
  onLike,
  onFavorite,
  onFollow,
}: {
  book: ExplorePostDto;
  onLike: (id: string) => void;
  onFavorite: (id: string) => void;
  onFollow: (userId: string) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const genres = getBookGenres(book);
  const authorName = getAuthorName(book);
  const isFavorite = getFavoriteState(book);

  return (
    <section className="w-full bg-[#E8F1FC] border border-[#8F8E8A] px-4 sm:px-8 md:px-[94px] pt-[18px] pb-[25px] flex flex-col md:h-[350px]">
      <div className="shrink-0 pb-[5px]">
        <h2 className="m-0">
          <span className="text-[#1B1C1E] text-[36px] font-bold">
            Destacado
          </span>
        </h2>
      </div>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-5 md:gap-6 items-center md:items-stretch">
        <button
          type="button"
          onClick={() => navigate(`/post/${book.id}`)}
          className="w-[170px] h-[255px] md:h-full md:w-auto md:aspect-[2/3] shrink-0 overflow-hidden shadow-[4px_4px_4px_rgba(0,0,0,0.15)] bg-[#D9D9D9] border-0 p-0 cursor-pointer"
        >
          <LiteratureCover
            title={book.title}
            coverUrl={getBookCoverUrl(book)}
            documentUrl={getBookDocumentUrl(book)}
            mimeType={getBookMimeType(book)}
            width={170}
            fit="cover"
            className="w-full h-full object-cover"
          />
        </button>

        <div className="w-full md:flex-1 min-w-0 md:h-full flex flex-col pt-0 md:pt-[20px]">
          <div>
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-3 md:gap-4">
              <div className="min-w-0 flex-1 flex flex-col gap-[3px]">
                <button
                  type="button"
                  onClick={() => navigate(`/post/${book.id}`)}
                  className="bg-transparent border-0 p-0 text-left cursor-pointer max-w-full"
                >
                  <span
                    title={book.title ?? "Sin título"}
                    className="block text-[#1B1C1E] hover:underline text-[24px] font-semibold leading-[28px] mb-[8px] truncate max-w-full"
                  >
                    {book.title ?? "Sin título"}
                  </span>
                </button>

                <div className="flex flex-row gap-[23px] items-center">
                  <button
                    type="button"
                    onClick={() => navigate(`/user/${book.userId}`)}
                    className="text-[#6B6B6B] hover:underline cursor-pointer text-[18px] leading-none mb-[10px] bg-transparent border-0 p-0"
                  >
                    @{authorName}
                  </button>

                  <button
                    type="button"
                    onClick={() => onFollow(book.userId)}
                    className="h-[24px] px-[22px] rounded-full border border-[#1B1C1E] bg-[#E8F1FC] hover:bg-[#BFD1EA] cursor-pointer"
                  >
                    <span className="text-[#1B1C1E] text-[11px] font-medium leading-none">
                      {book.isFollowingAuthor
                        ? t("profile.unfollow")
                        : t("profile.follow")}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-row gap-2 self-start shrink-0">
                {genres.length > 0 ? (
                  genres.map((genre) => (
                    <span
                      key={genre}
                      className="inline-flex items-center justify-center h-[26px] px-4 rounded-full border border-[#464749] text-[#464749] text-[11px] font-medium bg-[#E8F1FC]"
                    >
                      {genre}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center justify-center h-[26px] px-4 rounded-full border border-[#464749] text-[#464749] text-[11px] font-medium bg-[#E8F1FC]">
                    Sin género
                  </span>
                )}
              </div>
            </div>

            <div className="pt-[15px] flex flex-col">
              <span className="text-[#1B1C1E] text-[16px] font-bold leading-none mb-[8px]">
                Sinopsis
              </span>

              <p
              onClick={() => navigate(`/post/${book.id}`)} 
              className="m-0 text-[#1B1C1E] text-[13px] leading-[20px] text-justify line-clamp-3 overflow-hidden cursor-pointer">
                {book.content || t("explore.literature.no_description")}
              </p>
            </div>
          </div>

          <div className="mt-auto flex items-center gap-4 pt-[10px]">
            <button
              type="button"
              onClick={() => navigate(`/read/${book.id}`)}
              className="krea-save-button h-[44px] px-[30px] cursor-pointer hover:bg-[#093B05] rounded-full bg-[#0B5107] border border-[#1B1C1E]"
            >
              <span className="text-[#E3E2DE] text-[14px] font-medium leading-none">
                Leer ahora
              </span>
            </button>

            <CircleActionButton
              ariaLabel="Guardar libro"
              onClick={(event) => {
                event.stopPropagation();
                onFavorite(book.id);
              }}
            >
              <Bookmark
                size={20}
                className={isFavorite ? "fill-[#0B5107] text-[#0B5107]" : ""}
              />
            </CircleActionButton>

            <CircleActionButton
              ariaLabel="Dar me gusta"
              onClick={(event) => {
                event.stopPropagation();
                onLike(book.id);
              }}
            >
              <Heart
                size={20}
                className={
                  book.isLikedByCurrentUser
                    ? "fill-[#0B5107] text-[#0B5107]"
                    : ""
                }
              />
            </CircleActionButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function LiteratureTrendingBook({ book }: { book: ExplorePostDto }) {
  const navigate = useNavigate();
  const authorName = getAuthorName(book);

  return (
    <button
      type="button"
      onClick={() => navigate(`/post/${book.id}`)}
      className="min-w-0 text-left bg-transparent border-0 p-0 cursor-pointer"
    >
      <div className="aspect-[2/3] cursor-pointer overflow-hidden shadow-[4px_4px_4px_rgba(0,0,0,0.15)] mb-2 bg-[#D9D9D9]">
        <LiteratureCover
          title={book.title}
          coverUrl={getBookCoverUrl(book)}
          documentUrl={getBookDocumentUrl(book)}
          mimeType={getBookMimeType(book)}
          width={160}
          fit="cover"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col min-w-0">
        <span
          title={book.title ?? "Sin título"}
          className="text-[#1B1C1E] mx-[4px] cursor-pointer hover:underline text-[18px] font-semibold leading-tight truncate"
        >
          {book.title ?? "Sin título"}
        </span>

        <span className="text-[#6B6B6B] mx-[4px] cursor-pointer hover:underline text-[14px] leading-tight truncate">
          @{authorName}
        </span>
      </div>
    </button>
  );
}

function LiteratureRecentBook({
  book,
  onLike,
  onFavorite,
}: {
  book: ExplorePostDto;
  onLike: (id: string) => void;
  onFavorite: (id: string) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const genres = getBookGenres(book);
  const authorName = getAuthorName(book);
  const isFavorite = getFavoriteState(book);

  return (
    <article className="w-full h-[185px] bg-[#E8F1FC] border border-[#8F8E8A] p-[15px]">
      <div className="flex h-full gap-[22px] items-center">
        <button
          type="button"
          onClick={() => navigate(`/post/${book.id}`)}
          className="h-full aspect-[2/3] shrink-0 overflow-hidden shadow-[4px_4px_4px_rgba(0,0,0,0.15)] bg-[#D9D9D9] border-0 p-0 cursor-pointer"
        >
          <LiteratureCover
            title={book.title}
            coverUrl={getBookCoverUrl(book)}
            documentUrl={getBookDocumentUrl(book)}
            mimeType={getBookMimeType(book)}
            width={105}
            fit="cover"
            className="w-full h-full object-cover"
          />
        </button>

        <div className="h-full flex flex-col min-w-0 flex-1">
          <div className="flex items-start justify-between gap-[12px] min-w-0">
            <div className="min-w-0 flex-1 flex flex-col gap-[0px]">
              <button
                type="button"
                onClick={() => navigate(`/post/${book.id}`)}
                className="bg-transparent border-0 p-0 text-left cursor-pointer min-w-0 max-w-full"
              >
                <span
                  title={book.title ?? "Sin título"}
                  className="block text-[24px] cursor-pointer hover:underline leading-[26px] font-bold text-[#1B1C1E] truncate max-w-full"
                >
                  {book.title ?? "Sin título"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/user/${book.userId}`)}
                className="mt-[2px] bg-transparent border-0 p-0 text-left cursor-pointer w-fit"
              >
                <span className="text-[13px] hover:underline leading-[13px] font-medium text-[#1B1C1E]">
                  @{authorName}
                </span>
              </button>
            </div>

            <span
              title={genres.length ? genres.join(", ") : "Sin género"}
              className="pt-[2px] text-[12px] font-medium text-[#1B1C1E] whitespace-nowrap shrink-0 max-w-[160px] overflow-hidden text-ellipsis"
            >
              {genres.length ? genres.join(", ") : "Sin género"}
            </span>
          </div>

          <div className="mt-[5px] h-auto min-w-0">
            <span 
            onClick={() => navigate(`/post/${book.id}`)}
            className="text-[13px] text-justify font-medium text-[#1B1C1E] line-clamp-4 overflow-hidden cursor-pointer">
              {book.content || t("explore.literature.no_description")}
            </span>
          </div>

          <div className="mt-auto pt-[10px] flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/read/${book.id}`)}
              className="krea-save-button px-[33px] py-[1px] rounded-full bg-[#0B5107] border border-[#1B1C1E]"
            >
              <span className="text-[11px] font-medium leading-5 text-[#E3E2DE]">
                Leer
              </span>
            </button>

            <CircleActionButton
              size="sm"
              ariaLabel="Guardar libro"
              onClick={(event) => {
                event.stopPropagation();
                onFavorite(book.id);
              }}
            >
              <Bookmark
                size={14}
                className={isFavorite ? "fill-[#0B5107] text-[#0B5107]" : ""}
              />
            </CircleActionButton>

            <CircleActionButton
              size="sm"
              ariaLabel="Dar me gusta"
              onClick={(event) => {
                event.stopPropagation();
                onLike(book.id);
              }}
            >
              <Heart
                size={14}
                className={
                  book.isLikedByCurrentUser
                    ? "fill-[#0B5107] text-[#0B5107]"
                    : ""
                }
              />
            </CircleActionButton>
          </div>
        </div>
      </div>
    </article>
  );
}

function LiteratureSidebar() {
  return (
    <aside className="w-full lg:w-[300px] shrink-0">
      <div className="bg-[#E8F1FC] border border-[#8F8E8A] rounded-[10px] p-[18px] shadow-[4px_4px_4px_rgba(0,0,0,0.10)]">
        <h3 className="m-0 pb-[14px] text-[#1B1C1E] text-[22px] font-bold">
          Géneros en tendencia
        </h3>

        <div className="flex flex-wrap gap-2">
          {MOCK_TRENDING_GENRES.map((genre) => (
            <span
              key={genre}
              className="inline-flex h-[28px] px-4 items-center justify-center rounded-full border border-[#464749] text-[#464749] text-[12px] bg-[#E8F1FC]"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-[#E8F1FC] border border-[#8F8E8A] rounded-[10px] p-[18px] shadow-[4px_4px_4px_rgba(0,0,0,0.10)]">
        <h3 className="m-0 pb-[14px] text-[#1B1C1E] text-[22px] font-bold">
          Autores en tendencia
        </h3>

        <div className="flex flex-col gap-3">
          {MOCK_TRENDING_AUTHORS.map((author) => (
            <div
              key={author}
              className="flex items-center justify-between gap-3 border-b border-[#C4C3BF] last:border-b-0 pb-2 last:pb-0"
            >
              <span className="text-[#1B1C1E] text-[15px] truncate">
                @{author}
              </span>

              <button
                type="button"
                className="h-[24px] px-[14px] rounded-full border border-[#1B1C1E] bg-[#E8F1FC] hover:bg-[#BFD1EA] cursor-pointer text-[11px]"
              >
                Seguir
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function ExploreLiterature({
  selectedTag,
  selectedArtist,
}: ExploreLiteratureProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  const [featuredBook, setFeaturedBook] = useState<ExplorePostDto | null>(null);
  const [books, setBooks] = useState<ExplorePostDto[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<ExplorePostDto[]>([]);
  const [loading, setLoading] = useState(true);

  const updateBook = (
    postId: string,
    updater: (book: ExplorePostDto) => ExplorePostDto
  ) => {
    setBooks((prev) =>
      prev.map((book) => (book.id === postId ? updater(book) : book))
    );

    setTrendingBooks((prev) =>
      prev.map((book) => (book.id === postId ? updater(book) : book))
    );

    setFeaturedBook((prev) =>
      prev && prev.id === postId ? updater(prev) : prev
    );
  };

  const updateAuthorFollow = (
    userId: string,
    updater: (book: ExplorePostDto) => ExplorePostDto
  ) => {
    setBooks((prev) =>
      prev.map((book) => (book.userId === userId ? updater(book) : book))
    );

    setTrendingBooks((prev) =>
      prev.map((book) => (book.userId === userId ? updater(book) : book))
    );

    setFeaturedBook((prev) =>
      prev && prev.userId === userId ? updater(prev) : prev
    );
  };

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);

      try {
        const tags = selectedTag ? [selectedTag] : undefined;

        const [featuredRes, trendingRes, booksRes] = await Promise.all([
          postsApi.explore({
            category: "Text",
            tags,
            sortBy: "trending",
            page: 1,
            pageSize: 1,
          }),
          postsApi.explore({
            category: "Text",
            tags,
            sortBy: "trending",
            page: 1,
            pageSize: 6,
          }),
          postsApi.explore({
            category: "Text",
            tags,
            page: 1,
            pageSize: 20,
          }),
        ]);

        const featured = featuredRes.data?.items?.[0] ?? null;
        const trending = trendingRes.data?.items ?? [];
        const allBooks = booksRes.data?.items ?? [];

        setFeaturedBook(featured);
        setTrendingBooks(
          trending.filter((book) => book.id !== featured?.id).slice(0, 5)
        );
        setBooks(allBooks);
      } catch (err) {
        console.error("Error loading explore literature:", err);
        message.error(t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    void fetchBooks();
  }, [selectedTag, selectedArtist, t]);

  const handleLike = async (postId: string) => {
    if (!isAuthenticated || !user) {
      message.warning(t("post.auth_required"));
      return;
    }

    const source =
      books.find((book) => book.id === postId) ??
      trendingBooks.find((book) => book.id === postId) ??
      (featuredBook?.id === postId ? featuredBook : null);

    if (!source) return;

    const wasLiked = source.isLikedByCurrentUser;

    updateBook(postId, (book) => ({
      ...book,
      isLikedByCurrentUser: !wasLiked,
      likesCount: Math.max(0, (book.likesCount ?? 0) + (wasLiked ? -1 : 1)),
    }));

    try {
      if (wasLiked) {
        await postsApi.unlike(postId, { postId, userId: user.id });
      } else {
        await postsApi.like(postId, { postId, userId: user.id });
      }
    } catch (error) {
      console.error("Error toggling like in ExploreLiterature:", error);

      updateBook(postId, (book) => ({
        ...book,
        isLikedByCurrentUser: wasLiked,
        likesCount: Math.max(0, (book.likesCount ?? 0) + (wasLiked ? 1 : -1)),
      }));

      message.error(t("post.like_error"));
    }
  };

  const handleFavorite = async (postId: string) => {
    if (!isAuthenticated) {
      message.warning(t("post.auth_required"));
      return;
    }

    const source =
      books.find((book) => book.id === postId) ??
      trendingBooks.find((book) => book.id === postId) ??
      (featuredBook?.id === postId ? featuredBook : null);

    if (!source) return;

    const wasFavorite = getFavoriteState(source);

    updateBook(postId, (book) => ({
      ...book,
      isFavorite: !wasFavorite,
      isFavoritedByCurrentUser: !wasFavorite,
    } as ExplorePostDto));

    try {
      await postsApi.toggleFavorite(postId);
    } catch (error) {
      console.error("Error toggling favorite in ExploreLiterature:", error);

      updateBook(postId, (book) => ({
        ...book,
        isFavorite: wasFavorite,
        isFavoritedByCurrentUser: wasFavorite,
      } as ExplorePostDto));

      message.error(t("post.bookmark_error"));
    }
  };

  const handleFollow = async (userId: string) => {
    if (!isAuthenticated) {
      message.warning(t("post.auth_required"));
      return;
    }

    const source =
      books.find((book) => book.userId === userId) ??
      trendingBooks.find((book) => book.userId === userId) ??
      (featuredBook?.userId === userId ? featuredBook : null);

    if (!source) return;

    const wasFollowing = source.isFollowingAuthor;

    updateAuthorFollow(userId, (book) => ({
      ...book,
      isFollowingAuthor: !wasFollowing,
    }));

    try {
      if (wasFollowing) {
        await userService.unfollow(userId);
      } else {
        await userService.follow(userId);
      }
    } catch (error) {
      console.error("Error toggling follow in ExploreLiterature:", error);

      updateAuthorFollow(userId, (book) => ({
        ...book,
        isFollowingAuthor: wasFollowing,
      }));

      message.error(t("profile.follow_error"));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Spin size="large" />
      </div>
    );
  }

  const recentBooks = books.filter((book) => book.id !== featuredBook?.id);

  return (
    <div className="w-full pt-0">
      {(selectedTag || selectedArtist) && (
        <div className="max-w-[1129px] mx-auto mb-4 text-[#1B1C1E] text-sm px-4">
          {selectedTag && <span>Tag: {selectedTag}</span>}
          {selectedTag && selectedArtist && <span> · </span>}
          {selectedArtist && <span>Artist: {selectedArtist}</span>}
        </div>
      )}

      {featuredBook ? (
        <LiteratureFeaturedCard
          book={featuredBook}
          onLike={handleLike}
          onFavorite={handleFavorite}
          onFollow={handleFollow}
        />
      ) : (
        <div className="flex justify-center py-20">
          <Empty description="No hay libros destacados para mostrar." />
        </div>
      )}

      <div className="mt-6 flex flex-col lg:flex-row gap-6 pb-[20px] max-w-[1129px] mx-auto px-4">
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex flex-col gap-8">
            {trendingBooks.length > 0 && (
              <section>
                <div className="pb-[10px]">
                  <h3 className="m-0">
                    <span className="text-[#1B1C1E] text-[24px] font-bold">
                      Libros en tendencia
                    </span>
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-5">
                  {trendingBooks.map((book) => (
                    <LiteratureTrendingBook key={book.id} book={book} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="pb-[10px]">
                <h3 className="m-0">
                  <span className="text-[#1B1C1E] text-[24px] font-bold">
                    Lecturas recientes
                  </span>
                </h3>
              </div>

              {recentBooks.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {recentBooks.map((book) => (
                    <LiteratureRecentBook
                      key={book.id}
                      book={book}
                      onLike={handleLike}
                      onFavorite={handleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-10 bg-[#E8F1FC] border border-[#8F8E8A] rounded-[10px]">
                  <Empty description="No hay libros recientes para mostrar." />
                </div>
              )}
            </section>
          </div>
        </div>

        <LiteratureSidebar />
      </div>
    </div>
  );
}