// app/components/Explore/ExploreLiterature.tsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Spin, message, Button } from "antd";
import { Heart, Bookmark, UserPlus, UserCheck } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { postsApi } from "../../services/postsService";
import { userService } from "../../services/userService";
import type { ExplorePostDto } from "../../types/api";
import { useNavigate } from "react-router-dom";

const LiteratureFeaturedCard: React.FC<{ book: ExplorePostDto; onLike: (id: string) => void; onFavorite: (id: string) => void; onFollow: (userId: string) => void }> = ({ book, onLike, onFavorite, onFollow }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="bg-[#E9F1FC] border border-[#95ACCC] rounded-[10px] p-6 flex gap-6">
      <img src={book.coverUrl || book.previewUrl || "https://placehold.co/182x281"} alt={book.title} className="w-44 h-64 object-cover shadow-md" />
      <div className="flex-1">
        <div className="flex justify-between">
          <div>
            <h2 className="text-2xl font-bold">{book.title}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-gray-600">@{book.authorUsername}</span>
              <Button size="small" onClick={() => onFollow(book.userId)} icon={book.isFollowingAuthor ? <UserCheck size={14} /> : <UserPlus size={14} />}>
                {book.isFollowingAuthor ? t("profile.unfollow") : t("profile.follow")}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {book.genres.map(g => <span key={g} className="px-2 py-0.5 rounded-full border border-gray-500 text-xs bg-white">{g}</span>)}
          </div>
        </div>
        <div className="mt-4">
          <h4 className="font-semibold">{t("explore.literature.synopsis")}</h4>
          <p className="text-sm text-justify">{book.content || t("explore.literature.no_description")}</p>
        </div>
        <div className="flex gap-4 mt-4">
          <Button type="primary"  onClick={() => navigate(`/read/${book.id}`)} className="bg-green-700">{t("explore.literature.read_now")}</Button>
          <button onClick={() => onLike(book.id)} className="w-10 h-10 rounded-full border border-green-700 bg-green-50 flex items-center justify-center">
            <Heart size={20} className={book.isLikedByCurrentUser ? "fill-green-700" : ""} />
          </button>
          <button onClick={() => onFavorite(book.id)} className="w-10 h-10 rounded-full border border-green-700 bg-green-50 flex items-center justify-center">
            <Bookmark size={20} className={book.isFavorite ? "fill-green-700" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
};

const LiteratureTrendingBook: React.FC<{ book: ExplorePostDto }> = ({ book }) => {
  const navigate = useNavigate(); 
  return (

    <div className="w-36 shrink-0 cursor-pointer hover:opacity-80" onClick={() => navigate(`/read/${book.id}`)}>
      <img src={book.coverUrl || book.previewUrl || "https://placehold.co/123x190"} alt={book.title} className="w-full h-48 object-cover rounded shadow" />
      <p className="font-medium text-sm truncate mt-1">{book.title}</p>
      <p className="text-xs text-gray-500 truncate">@{book.authorUsername}</p>
    </div>
  );
};

const LiteratureRecentBook: React.FC<{ book: ExplorePostDto; onLike: (id: string) => void; onFavorite: (id: string) => void }> = ({ book, onLike, onFavorite }) => {
  const { t } = useTranslation();
  const navigate = useNavigate(); 

  return (
    <div className="bg-[#E9F1FC] border border-[#95ACCC] rounded-[10px] p-4 flex gap-4"   onClick={() => navigate(`/read/${book.id}`)}
>
      <img src={book.coverUrl || book.previewUrl || "https://placehold.co/92x143"} alt={book.title} className="w-24 h-36 object-cover shadow" />
      <div className="flex-1">
        <div className="flex justify-between items-start flex-wrap">
          <div>
            <h3 className="text-lg font-bold">{book.title}</h3>
            <p className="text-sm text-gray-600">@{book.authorUsername}</p>
          </div>
          <div className="text-xs text-gray-500">{book.genres.join(", ")}</div>
        </div>
        <p className="text-xs text-justify mt-2 line-clamp-3">{book.content}</p>
        <div className="flex gap-2 mt-2">
          <Button size="small" type="primary" className="bg-green-700 text-xs">{t("explore.literature.read")}</Button>
          <button onClick={() => onLike(book.id)} className="w-7 h-7 rounded-full border border-green-700 bg-green-50 flex items-center justify-center">
            <Heart size={14} className={book.isLikedByCurrentUser ? "fill-green-700" : ""} />
          </button>
          <button onClick={() => onFavorite(book.id)} className="w-7 h-7 rounded-full border border-green-700 bg-green-50 flex items-center justify-center">
            <Bookmark size={14} className={book.isFavorite ? "fill-green-700" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ExploreLiterature({ selectedTag }: { selectedTag?: string | null }) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [books, setBooks] = useState<ExplorePostDto[]>([]);
  const [trending, setTrending] = useState<ExplorePostDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const tags = selectedTag ? [selectedTag] : undefined;
        const res = await postsApi.explore({ category: "Text", tags, pageSize: 20 });
        const all = res.data.items || [];
        setBooks(all);
        setTrending(all.slice(0, 5));
      } catch (err) {
        console.error(err);
        message.error(t("common.error"));
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [selectedTag, t]);

  const handleLike = async (postId: string) => {
    if (!isAuthenticated) { message.warning(t("post.auth_required")); return; }
    const book = books.find(b => b.id === postId);
    if (!book) return;
    const wasLiked = book.isLikedByCurrentUser;
    setBooks(prev => prev.map(b => b.id === postId ? { ...b, isLikedByCurrentUser: !wasLiked, likesCount: b.likesCount + (wasLiked ? -1 : 1) } : b));
    setTrending(prev => prev.map(b => b.id === postId ? { ...b, isLikedByCurrentUser: !wasLiked, likesCount: b.likesCount + (wasLiked ? -1 : 1) } : b));
    try {
      if (wasLiked) await postsApi.unlike(postId, { postId, userId: user!.id });
      else await postsApi.like(postId, { postId, userId: user!.id });
    } catch {
      setBooks(prev => prev.map(b => b.id === postId ? { ...b, isLikedByCurrentUser: wasLiked, likesCount: b.likesCount + (wasLiked ? 1 : -1) } : b));
      setTrending(prev => prev.map(b => b.id === postId ? { ...b, isLikedByCurrentUser: wasLiked, likesCount: b.likesCount + (wasLiked ? 1 : -1) } : b));
      message.error(t("post.like_error"));
    }
  };

  const handleFavorite = async (postId: string) => {
    if (!isAuthenticated) { message.warning(t("post.auth_required")); return; }
    const book = books.find(b => b.id === postId);
    if (!book) return;
    const wasFav = book.isFavorite;
    setBooks(prev => prev.map(b => b.id === postId ? { ...b, isFavorite: !wasFav } : b));
    setTrending(prev => prev.map(b => b.id === postId ? { ...b, isFavorite: !wasFav } : b));
    try {
      await postsApi.toggleFavorite(postId);
    } catch {
      setBooks(prev => prev.map(b => b.id === postId ? { ...b, isFavorite: wasFav } : b));
      setTrending(prev => prev.map(b => b.id === postId ? { ...b, isFavorite: wasFav } : b));
      message.error(t("post.bookmark_error"));
    }
  };

  const handleFollow = async (userId: string) => {
    if (!isAuthenticated) { message.warning(t("post.auth_required")); return; }
    const book = books.find(b => b.userId === userId);
    if (!book) return;
    const wasFollowing = book.isFollowingAuthor;
    setBooks(prev => prev.map(b => b.userId === userId ? { ...b, isFollowingAuthor: !wasFollowing } : b));
    setTrending(prev => prev.map(b => b.userId === userId ? { ...b, isFollowingAuthor: !wasFollowing } : b));
    try {
      if (wasFollowing) await userService.unfollow(userId);
      else await userService.follow(userId);
    } catch {
      setBooks(prev => prev.map(b => b.userId === userId ? { ...b, isFollowingAuthor: wasFollowing } : b));
      setTrending(prev => prev.map(b => b.userId === userId ? { ...b, isFollowingAuthor: wasFollowing } : b));
      message.error(t("profile.follow_error"));
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Spin size="large" /></div>;

  const featured = books[0];
  const recent = books.slice(1);

  return (
    <div className="max-w-[1129px] mx-auto px-4 pb-10">
      {featured && <LiteratureFeaturedCard book={featured} onLike={handleLike} onFavorite={handleFavorite} onFollow={handleFollow} />}
      {trending.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 text-[#1B1C1E]">{t("explore.literature.trending")}</h2>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {trending.map(book => <LiteratureTrendingBook key={book.id} book={book} />)}
          </div>
        </div>
      )}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4 text-[#1B1C1E]">{t("explore.literature.recent")}</h2>
        <div className="space-y-4">
          {recent.map(book => <LiteratureRecentBook key={book.id} book={book} onLike={handleLike} onFavorite={handleFavorite} />)}
        </div>
      </div>
    </div>
  );
}