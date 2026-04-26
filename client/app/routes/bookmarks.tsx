// deno-lint-ignore-file
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Spin, message, Alert, Grid } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { postsApi } from '../services/postsService.ts';
import PostCard from '../components/Posts/PostCard.tsx';
import TagsSidebar from '../components/Home/TagsSidebar.tsx';
import type { PostDto } from '../types/api.ts';

export default function BookmarksPage() {
  const { useBreakpoint } = Grid;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const fetchFavorites = async () => {
      try {
        const res = await postsApi.getFavorites();
        const data: any = res.data;
        const favoritePosts = Array.isArray(data)
          ? data
          : data.items ?? data.posts ?? [];

        const postsWithBookmark = favoritePosts.map((post: any) => ({
          ...post,
          isFavoritedByCurrentUser: true,
          media: (post.media ?? post.Media ?? []).map((m: any) => ({
            ...m,
            id: m.id ?? m.Id,
            fileName: m.fileName ?? m.FileName,
            mimeType: m.mimeType ?? m.MimeType,
            url: m.url ?? m.Url,
            isWorkMedia: m.isWorkMedia ?? m.IsWorkMedia ?? false,
            coverUrl:
              m.coverUrl ??
              m.CoverUrl ??
              post.coverUrl ??
              post.CoverUrl,
            coverMediaId:
              m.coverMediaId ??
              m.CoverMediaId ??
              post.coverMediaId ??
              post.CoverMediaId,
            coverMimeType:
              m.coverMimeType ??
              m.CoverMimeType ??
              post.coverMimeType ??
              post.CoverMimeType,
          })),
        }));

        setPosts(postsWithBookmark);
      } catch (err) {
        console.error(err);
        setError(t('bookmarks.load_error'));
        message.error(t('bookmarks.load_error'));
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [isAuthenticated, navigate, t]);

  const handleBookmarkChange = (postId: string) => {
    // Eliminar el post de la lista local cuando se desmarque como favorito
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Alert message={error} type="error" showIcon />
      </div>
    );
  }

return (
  <div className="min-h-screen bg-[#E3E2DE]">
    <main className="flex justify-center px-2 sm:px-4 gap-6">
      <div className={`flex-1 ${!isMobile ? "w-[870px] mx-auto" : "w-full"} `}>
        <div className="flex items-center gap-3 my-[11px] max-w-7xl mx-auto ">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-[32px] h-[32px] hover:bg-gray-200 rounded-full transition cursor-pointer"
          >
            <ArrowLeft size={24} className="text-gray-800" />
          </button>
          <div className="pt-[10px]">
            <h1 className="text-xl font-medium text-gray-800 leading-none">
              {t('bookmarks.title')}
            </h1>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {t('bookmarks.empty')}
          </div>
        ) : (
          <div className="space-y-6 pb-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onBookmark={() => handleBookmarkChange(post.id)}
              />
            ))}
          </div>
        )}
      </div>

      {!isMobile && (
        <div className="w-64 shrink-0 pt-4">
          <TagsSidebar />
        </div>
      )}
    </main>
  </div>
);
}