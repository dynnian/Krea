import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Spin, message, Alert, Avatar } from 'antd';
import { ArrowLeft, Heart, MessageCircle, Repeat2, User, MoreHorizontal, Bookmark } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import TagsSidebar from '../Home/TagsSidebar';
import PostImageDetail from './PostImageDetail';
import PostAudioDetail from './PostAudioDetail';
import CommentSection from './CommentSection';
import { postsApi } from '../../services/postsService';
import type { PostDto } from '../../types/api';

const getMediaType = (mimeType?: string): 'image' | 'audio' | 'pdf' | 'text' => {
  if (!mimeType) return 'text';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'music/mpeg' || mimeType === 'audio/mpeg') return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'text';
};

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<PostDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [reposted, setReposted] = useState(false);
  const [repostsCount, setRepostsCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const postRes = await postsApi.getPost(id);
        const postData = postRes.data;
        setPost(postData);
        setLiked(postData.isLikedByCurrentUser);
        setLikesCount(postData.likesCount);
        setReposted(postData.isRetweetedByCurrentUser);
        setRepostsCount(postData.isRetweetedByCurrentUser ? 1 : 0);
        setCommentsCount(postData.replies?.length ?? 0);
        setIsBookmarked((postData as any).isFavoritedByCurrentUser ?? false);
      } catch (err) {
        console.error(err);
        setError(t('post.load_error'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
    setLikesCount(prev => (wasLiked ? prev - 1 : prev + 1));
    try {
      if (wasLiked) {
        await postsApi.unlike(post.id, { postId: post.id, userId: user!.id });
      } else {
        await postsApi.like(post.id, { postId: post.id, userId: user!.id });
      }
    } catch {
      setLiked(wasLiked);
      setLikesCount(prev => (wasLiked ? prev + 1 : prev - 1));
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
    setRepostsCount(prev => (wasReposted ? prev - 1 : prev + 1));
    try {
      await postsApi.repost(post.id, { authorId: user!.id, originalPostId: post.id });
      message.success(t('post.reposted'));
    } catch {
      setReposted(wasReposted);
      setRepostsCount(prev => (wasReposted ? prev + 1 : prev - 1));
      message.error(t('post.repost_error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleBookmark = async () => {
    if (!requireAuth() || !post) return;
    try {
      await postsApi.toggleFavorite(post.id);
      setIsBookmarked(prev => !prev);
      message.success(t('post.bookmark_toggled'));
    } catch {
      message.error(t('post.bookmark_error'));
    }
  };

  const handleComment = () => {
    if (!requireAuth()) return;
  };

  const handleCommentPosted = () => {
    setCommentsCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E3E2DE] flex justify-center items-center">
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

  if (!post) {
    return (
      <div className="min-h-screen bg-[#E3E2DE] flex justify-center items-center">
        <p className="text-gray-500">{t('post.not_found')}</p>
      </div>
    );
  }

  const formattedDate = new Date(post.uploadedAt).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const formattedTime = new Date(post.uploadedAt).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit',
  });

  const firstMedia = post.media?.[0];
  const mediaUrl = firstMedia?.url;
  const mediaMime = firstMedia?.mimeType;
  const mediaType = getMediaType(mediaMime);

  const authorName = post.authorName || `Usuario ${post.authorPostId.slice(0, 8)}`;
  const authorHandle = post.authorName ? `@${post.authorName}` : post.authorPostId.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#E3E2DE] py-8">
      <main className="flex justify-center px-4">
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl w-full">
          <div className="w-full lg:flex-1 lg:min-w-[740px]">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-200 rounded-full transition"
              >
                <ArrowLeft size={24} className="text-gray-800" />
              </button>
              <h1 className="text-xl font-medium text-gray-800">{t('post.publication')}</h1>
            </div>

            <div className="bg-[#E8F1FC] rounded-[15px] outline outline-[1.5px] outline-[#95ACCC] p-[22px] shadow-[4px_4px_13px_rgba(0,0,0,0.25)] mb-6">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <Avatar
                    icon={<User />}
                    size={48}
                    className="bg-white border border-black rounded-full"
                  />
                  <div>
                    <Link to={`/user/${post.authorPostId}`} className="hover:text-[#1351AA]">
                      <div className="font-medium text-[#1B1C1E]">{authorName}</div>
                      <div className="text-gray-500 text-sm">@{authorHandle}</div>
                    </Link>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-200 rounded-full">
                  <MoreHorizontal size={20} className="text-gray-500" />
                </button>
              </div>

              <p className="text-[#1B1C1E] text-justify text-[13px] leading-7 mt-4 mb-6">
                {post.content}
              </p>

              {firstMedia && mediaUrl && (
                <div className="mb-6">
                  {mediaType === 'image' && <PostImageDetail post={post} />}
                  {mediaType === 'audio' && <PostAudioDetail post={post} />}
                  {mediaType === 'pdf' && (
                    <div className="bg-[#F3F3F1] p-4 rounded-lg border border-[#8F8E8A] flex items-center gap-2">
                      <a
                        href={mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1351AA] underline hover:text-[#0B5107]"
                      >
                        {t('post.view_document') || 'Ver documento'}
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
                <span>{formattedTime}</span>
                <span>·</span>
                <span>{formattedDate}</span>
              </div>

              <div className="flex items-center justify-around py-4 border-t border-b border-[#8F8E8A] mt-4">
                <button
                  onClick={handleLike}
                  disabled={actionLoading !== null}
                  className={`flex items-center gap-2 text-gray-700 hover:text-blue-600 ${
                    actionLoading === 'like' ? 'opacity-50' : ''
                  }`}
                >
                  <Heart size={18} className={liked ? 'fill-red-500 text-red-500' : ''} />
                  <span>{likesCount}</span>
                </button>
                <button
                  onClick={handleComment}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                >
                  <MessageCircle size={18} />
                  <span>{commentsCount}</span>
                </button>
                <button
                  onClick={handleRepost}
                  disabled={actionLoading !== null}
                  className={`flex items-center gap-2 text-gray-700 hover:text-blue-600 ${
                    actionLoading === 'repost' ? 'opacity-50' : ''
                  }`}
                >
                  <Repeat2 size={18} className={reposted ? 'text-green-600' : ''} />
                  <span>{repostsCount}</span>
                </button>
                <button
                  onClick={handleBookmark}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                >
                  <Bookmark size={18} className={isBookmarked ? 'fill-green-500 text-green-500' : ''} />
                </button>
              </div>
            </div>

            <CommentSection
              postId={post.id}
              onCommentPosted={handleCommentPosted}
            />
          </div>

          <div className="hidden lg:block w-64 shrink-0">
            <TagsSidebar />
          </div>
        </div>
      </main>
    </div>
  );
}