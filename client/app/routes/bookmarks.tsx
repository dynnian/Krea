import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Spin, message, Alert } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { postsApi } from '../services/postsService';
import PostCard from '../components/Posts/PostCard';
import TagsSidebar from '../components/Home/TagsSidebar';
import type { PostDto } from '../types/api';

export default function BookmarksPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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
        // res.data ya es un array plano de PostDto
        const postsWithBookmark = res.data.map(post => ({ ...post, isFavoritedByCurrentUser: true }));
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
    <div className="min-h-screen bg-[#E3E2DE] py-8">
      <div className="flex justify-center px-4">
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl w-full">
          {/* Columna principal */}
          <div className="w-full lg:flex-1 min-w-0">
            {/* Cabecera con flecha de retroceso */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-8 h-8 hover:bg-gray-200 rounded-full transition"
              >
                <ArrowLeft size={24} className="text-gray-800" />
              </button>
              <h1 className="text-2xl font-medium text-gray-800">
                {t('bookmarks.title')}
              </h1>
            </div>

            {/* Lista de posts favoritos */}
            {posts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {t('bookmarks.empty')}
              </div>
            ) : (
              <div className="space-y-6">
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

          {/* Sidebar de etiquetas */}
          <div className="hidden lg:block w-64 shrink-0">
            <TagsSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}