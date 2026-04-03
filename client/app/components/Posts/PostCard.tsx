import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { Avatar, message, Modal } from 'antd';
import { Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal, User, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AudioWaveform from '../WaveSurfer/AudioWaveform';
import { postsApi } from '../../services/postsService';
import type { PostDto } from '../../types/api';

interface PostCardProps {
  post: PostDto;
  onLike?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onComment?: () => void;
  onBookmark?: () => void;
}

const getMediaType = (mimeType?: string): 'image' | 'audio' | 'pdf' | 'text' => {
  if (!mimeType) return 'text';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'music/mpeg' || mimeType === 'audio/mpeg' || mimeType === 'audio/mp3') return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'text';
};

export default function PostCard({ post, onLike, onRepost, onComment, onBookmark }: PostCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [liked, setLiked] = useState(post.isLikedByCurrentUser);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [reposted, setReposted] = useState(post.isRetweetedByCurrentUser);
  const [repostsCount, setRepostsCount] = useState(post.isRetweetedByCurrentUser ? 1 : 0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(post.isFavoritedByCurrentUser ?? false);

  const requireAuth = () => {
    if (!user) {
      message.warning(t('post.auth_required'));
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth() || actionLoading) return;
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
      onLike?.(post.id);
    } catch {
      setLiked(wasLiked);
      setLikesCount(prev => (wasLiked ? prev + 1 : prev - 1));
      message.error(t('post.like_error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRepost = async () => {
    if (!requireAuth() || actionLoading) return;
    setActionLoading('repost');
    const wasReposted = reposted;
    setReposted(!wasReposted);
    setRepostsCount(prev => (wasReposted ? prev - 1 : prev + 1));
    try {
      await postsApi.repost(post.id, { authorId: user!.id, originalPostId: post.id });
      message.success(t('post.reposted'));
      onRepost?.(post.id);
    } catch {
      setReposted(wasReposted);
      setRepostsCount(prev => (wasReposted ? prev + 1 : prev - 1));
      message.error(t('post.repost_error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleComment = () => {
    if (!requireAuth()) return;
    if (onComment) onComment();
    else navigate(`/post/${post.id}`);
  };

  const handleBookmarkClick = async () => {
    if (!requireAuth()) return;
    try {
      await postsApi.toggleFavorite(post.id);
      setIsBookmarked(prev => !prev);
      message.success(t('post.bookmark_toggled'));
      onBookmark?.();
    } catch {
      message.error(t('post.bookmark_error'));
    }
  };

  const firstMedia = post.media?.[0];
  const mediaUrl = firstMedia?.url;
  const mediaMime = firstMedia?.mimeType;
  const mediaType = getMediaType(mediaMime);

  const formattedDate = post.uploadedAt
    ? new Date(post.uploadedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    : '';

  // Usar authorName si existe, sino el ID truncado
  const authorName = post.authorName || `Usuario ${post.authorPostId.slice(0, 8)}`;
  const authorHandle = post.authorName ? `@${post.authorName}` : post.authorPostId.slice(0, 8);

  return (
    <article className="w-full min-w-0 bg-[#E8F1FC] rounded-[15px] outline outline-[1.5px] outline-[#95ACCC] p-[22px] shadow-[4px_4px_12.6px_rgba(0,0,0,0.25)] ">
      <div className="flex gap-3">
        <Link to={`/post/${post.id}`} className="flex gap-3 flex-1">
          <Avatar
            src={post.author?.avatar}
            icon={!post.author?.avatar && <User />}
            size={48}
            className="bg-white border border-black rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2 text-sm">
              <Link to={`/user/${post.authorPostId}`} className="font-bold text-[#1B1C1E] hover:text-[#1351AA]">
                {authorName}
              </Link>
              <span className="text-[#1B1C1E]">·</span>
              <Link to={`/user/${post.authorPostId}`} className="text-[#1B1C1E] hover:text-[#1351AA]">
                {authorHandle}
              </Link>
              <span className="text-[#1B1C1E]">·</span>
              <span className="text-[#1B1C1E]">{formattedDate}</span>
            </div>
            <p className="text-[#1B1C1E] text-justify text-[16px] leading-7 mt-1">{post.content}</p>
          </div>
        </Link>
        <button className="p-1 hover:bg-gray-200 rounded-full self-start">
          <MoreHorizontal size={16} className="text-gray-500" />
        </button>
      </div>

      {firstMedia && mediaUrl && (
        <div className="ml-0 sm:ml-[60px] mt-2">
          {mediaType === 'image' && (
            <>
              <img
                src={mediaUrl}
                alt="Imagen"
                className="w-full max-h-80 object-cover rounded-lg border border-gray-200 cursor-pointer"
                onClick={() => setIsImageModalOpen(true)}
              />
              <Modal
                open={isImageModalOpen}
                footer={null}
                onCancel={() => setIsImageModalOpen(false)}
                centered
                width="fit-content"
                styles={{ body: { padding: 0 } }}
              >
                <img src={mediaUrl} alt="Imagen completa" className="max-w-full max-h-screen" />
              </Modal>
            </>
          )}
          {mediaType === 'audio' && (
            <div className="bg-[#F3F3F1] p-4 rounded-lg border border-[#8F8E8A]">
              <AudioWaveform audioUrl={mediaUrl} />
            </div>
          )}
          {mediaType === 'pdf' && (
            <div className="bg-[#F3F3F1] p-4 rounded-lg border border-[#8F8E8A] flex items-center gap-2">
              <FileText size={18} className="text-[#1351AA]" />
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

      <div className="flex items-center gap-6 ml-0 sm:ml-[60px] mt-4 text-gray-600">
        <button
          className={`flex items-center gap-1 hover:text-blue-600 transition ${actionLoading === 'like' ? 'opacity-50 cursor-wait' : ''}`}
          onClick={handleLike}
          disabled={actionLoading !== null}
        >
          <Heart size={18} className={liked ? 'fill-red-500 text-red-500' : ''} />
          <span className="text-sm">{likesCount}</span>
        </button>
        <button
          className="flex items-center gap-1 hover:text-blue-600"
          onClick={handleComment}
        >
          <MessageCircle size={18} />
          <span className="text-sm">{post.replies?.length ?? 0}</span>
        </button>
        <button
          className={`flex items-center gap-1 hover:text-blue-600 ${actionLoading === 'repost' ? 'opacity-50 cursor-wait' : ''}`}
          onClick={handleRepost}
          disabled={actionLoading !== null}
        >
          <Repeat2 size={18} className={reposted ? 'text-green-600' : ''} />
          <span className="text-sm">{repostsCount}</span>
        </button>
        <button
          className="flex items-center gap-1 hover:text-blue-600"
          onClick={handleBookmarkClick}
        >
          <Bookmark size={18} className={isBookmarked ? 'fill-green-500 text-green-500' : ''} />
        </button>
      </div>
    </article>
  );
}