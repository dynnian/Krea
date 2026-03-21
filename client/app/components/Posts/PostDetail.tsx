// components/Posts/PostDetail.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Grid, message, Spin, Alert, Avatar } from 'antd';
import { ArrowLeft, Heart, MessageCircle, Repeat2, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import TagsSidebar from '../Home/TagsSidebar';
import PostImageDetail from './PostImageDetail';
import PostAudioDetail from './PostAudioDetail';
import CommentSection from './CommentSection';
import { postsApi } from '../../services/postsService';
import type { Post } from '../../types/post';
import { PostType } from '../../types/common';

const { useBreakpoint } = Grid;

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [reposted, setReposted] = useState(false);
  const [repostsCount, setRepostsCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      setLoading(true);
      try {
        const data = await postsApi.getPost(id);
        setPost(data);
        setLikesCount(data.likesCount || 0);
        setRepostsCount(data.repostsCount || 0);
        // TODO: determinar si el usuario ya ha dado like/repost (si la API lo devuelve)
      } catch (err) {
        console.error(err);
        setError(t('post.load_error'));
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, t]);

  const requireAuth = () => {
    if (!user) {
      message.warning(t('post.auth_required'));
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth() || actionLoading || !post) return;
    setActionLoading('like');
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);
    try {
      if (wasLiked) {
        await postsApi.unlike(post.id, { postId: post.id, userId: user!.id });
      } else {
        await postsApi.like(post.id, { postId: post.id, userId: user!.id });
      }
    } catch {
      setLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
      message.error(t('post.like_error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRepost = async () => {
    if (!requireAuth() || actionLoading || !post) return;
    setActionLoading('repost');
    const wasReposted = reposted;
    setReposted(!wasReposted);
    setRepostsCount(prev => wasReposted ? prev - 1 : prev + 1);
    try {
      await postsApi.repost(post.id, { authorId: user!.id, originalPostId: post.id });
      message.success(t('post.reposted'));
    } catch {
      setReposted(wasReposted);
      setRepostsCount(prev => wasReposted ? prev + 1 : prev - 1);
      message.error(t('post.repost_error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleComment = () => {
    if (!requireAuth()) return;
    // Si quieres enfocar el input, podrías usar una referencia
  };

  if (loading) return <div className="flex justify-center py-12"><Spin size="large" /></div>;
  if (error) return <Alert message={error} type="error" className="mx-4" />;
  if (!post) return <div className="text-center py-12">{t('post.not_found')}</div>;

  const formattedDate = new Date(post.created_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const formattedTime = new Date(post.created_at).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-[#E3E2DE]">
      <main className="flex justify-center px-2 sm:px-4">
        <div className="flex flex-col md:flex-row gap-6 max-w-7xl w-full">
          <div className="w-full md:w-[740px]">
            <div className="bg-[#E8F1FC] border-l-2 border-r-2 border-[#8F8E8A] px-6 py-6">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition">
                  <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <h1 className="text-xl font-medium text-gray-800">{t('post.publication')}</h1>
              </div>

              {/* Autor */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                  <Avatar src={post.author?.avatar} icon={<User />} size={48} className="bg-white border border-gray-800" />
                  <div>
                    <div className="font-medium text-gray-900">{post.author?.name || post.author?.displayName}</div>
                    <div className="text-gray-500 text-sm">@{post.author?.handle}</div>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-gray-700">⋯</button>
              </div>

              <p className="text-gray-800 text-justify mb-6">{post.content}</p>

              {/* Media según tipo */}
              {post.type === PostType.IMAGE && <PostImageDetail post={post} />}
              {post.type === PostType.MUSIC && <PostAudioDetail post={post} />}

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <span>{formattedTime}</span> <span>·</span> <span>{formattedDate}</span>
              </div>

              {/* Interacciones */}
              <div className="flex items-center justify-around py-4 border-t border-b border-[#8F8E8A] mb-6">
                <button onClick={handleLike} disabled={actionLoading !== null}
                  className={`flex items-center gap-2 text-gray-700 hover:text-blue-600 ${actionLoading === 'like' ? 'opacity-50' : ''}`}>
                  <Heart size={18} className={liked ? 'fill-red-500 text-red-500' : ''} />
                  <span>{likesCount}</span>
                </button>
                <button onClick={handleComment} className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                  <MessageCircle size={18} />
                  <span>{post.replies?.length || 0}</span>
                </button>
                <button onClick={handleRepost} disabled={actionLoading !== null}
                  className={`flex items-center gap-2 text-gray-700 hover:text-blue-600 ${actionLoading === 'repost' ? 'opacity-50' : ''}`}>
                  <Repeat2 size={18} className={reposted ? 'text-green-600' : ''} />
                  <span>{repostsCount}</span>
                </button>
              </div>

              <CommentSection postId={post.id} />
            </div>
          </div>

          {!isMobile && <div className="w-full md:w-64"><TagsSidebar /></div>}
        </div>
      </main>
    </div>
  );
}