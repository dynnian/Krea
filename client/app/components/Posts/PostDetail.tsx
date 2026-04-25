// deno-lint-ignore-file
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Spin, message, Alert, Avatar, Dropdown } from 'antd';
import { ArrowLeft, Heart, MessageCircle, Repeat2, User, MoreHorizontal, Bookmark, Flag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import TagsSidebar from '../Home/TagsSidebar.tsx';
import PostImageDetail from './PostImageDetail.tsx';
import PostAudioDetail from './PostAudioDetail.tsx';
import CommentSection from './CommentSection.tsx';
import { postsApi } from '../../services/postsService.ts';
import type { PostDto } from '../../types/api.ts';
import ReportModal from "../Reports/ReportModal.tsx";
import PostLinkDetail from './PostLinkDetail.tsx';

const getMediaType = (mimeType?: string): 'image' | 'audio' | 'book' | 'text' => {
  if (!mimeType) return 'text';
  if (mimeType.startsWith('image/')) return 'image';
  if (
    mimeType === 'music/mpeg' ||
    mimeType === 'audio/mpeg' ||
    mimeType === 'audio/mp3' ||
    mimeType.startsWith('audio/')
  ) {
    return 'audio';
  }
  if (
    mimeType === 'application/pdf' ||
    mimeType === 'application/epub+zip'
  ) {
    return 'book';
  }
  return 'text';
};

const getAuthorAvatar = (post: any) =>
  post.author?.avatar ??
  post.author?.profilePictureUrl ??
  post.authorProfilePictureUrl ??
  post.profilePictureUrl ??
  null;


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
  const [reportModalOpen, setReportModalOpen] = useState(false);

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

const originalPost = post?.repostOf ?? post;
const isRepost = !!post?.repostOf;
const repostAuthorName = isRepost ? post?.authorName : null;
const isOwnPost = !!originalPost && user?.id === originalPost.authorPostId;


  const handleLike = async () => {
    if (!requireAuth() || actionLoading || !originalPost) return;
    setActionLoading('like');
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount(prev => (wasLiked ? prev - 1 : prev + 1));
    try {
      if (wasLiked) {
        await postsApi.unlike(originalPost.id, { postId: originalPost.id, userId: user!.id });
      } else {
        await postsApi.like(originalPost.id, { postId: originalPost.id, userId: user!.id });
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
    if (!requireAuth() || actionLoading || !originalPost) return;
    setActionLoading('repost');
    const wasReposted = reposted;
    setReposted(!wasReposted);
    setRepostsCount(prev => (wasReposted ? prev - 1 : prev + 1));
    try {
      await postsApi.repost(originalPost.id, { authorId: user!.id, originalPostId: originalPost.id });
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
    if (!requireAuth() || !originalPost) return;
    try {
      await postsApi.toggleFavorite(originalPost.id);
      setIsBookmarked(prev => !prev);
      message.success(t('post.bookmark_toggled'));
    } catch {
      message.error(t('post.bookmark_error'));
    }
  };


  const handleCommentPosted = () => {
    setCommentsCount(prev => prev + 1);
  };
  const handleReportClick = () => {
    if (!requireAuth()) return;
    if (isOwnPost) {
      message.warning(t('post.cannot_report_own'));
      return;
    }
    setReportModalOpen(true);
  };
  const menuItems = [];
  if (!isOwnPost) {
    menuItems.push({
      key: 'report',
      label: t('post.report'),
      icon: <Flag size={16} />,
      onClick: handleReportClick,
    });
  }

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

  if (!originalPost) {
    return (
      <div className="min-h-screen bg-[#E3E2DE] flex justify-center items-center">
        <p className="text-gray-500">{t('post.not_found')}</p>
      </div>
    );
  }

  const formattedDate = new Date(originalPost.uploadedAt).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const formattedTime = new Date(originalPost.uploadedAt).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit',
  });

  const firstMedia = originalPost.media?.[0];
  const mediaUrl = firstMedia?.url;
  const mediaMime = firstMedia?.mimeType;
  const mediaType = getMediaType(mediaMime);

  const authorName = originalPost.authorName || `Usuario ${originalPost.authorPostId.slice(0, 8)}`;
  const authorHandle = originalPost.authorName ? `@${originalPost.authorName}` : originalPost.authorPostId.slice(0, 8);
  const authorAvatar = getAuthorAvatar(originalPost);

  return (
    <div className="min-h-screen bg-[#E3E2DE]">
      <div className="flex items-center gap-3 my-[11px] max-w-7xl mx-auto px-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-[32px] h-[32px] hover:bg-gray-200 rounded-full transition cursor-pointer"
        >
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <div className="pt-[10px]">
          <h1 className="text-xl font-medium text-gray-800 leading-none">{t('post.publication')}</h1>
        </div>
      </div>
      <main className="flex justify-center px-4">
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl w-full mx-auto">
          <div className="w-full xl:w-[870px] xl:flex-none min-w-0">
            <div className="bg-[#E8F1FC] rounded-[15px] outline outline-[1.5px] outline-[#95ACCC] p-[22px] shadow-[4px_4px_13px_rgba(0,0,0,0.25)] mb-6">
              {isRepost && (
                <div className="text-xs text-gray-500 mb-2 ml-[60px]">
                  {t('post.reposted_by')} {repostAuthorName}
                </div>
              )}
              {mediaType === 'audio' ? (
                <PostAudioDetail
                  post={originalPost}
                  formattedDate={formattedDate}
                  formattedTime={formattedTime}
                  menuItems={menuItems}
                />
              ) : (
                <>
                  <div className="flex justify-between items-start mb-[20px]">
                    <div className="flex gap-3">
                    <Avatar
                      src={authorAvatar ?? undefined}
                      icon={!authorAvatar && <User />}
                      size={48}
                      className="bg-white border border-black rounded-full"
                    />
                      <div>
                        <Link to={`/user/${originalPost.authorPostId}`} className="hover:text-[#1351AA]">
                          <div className="font-medium text-[#1B1C1E]">{authorName}</div>
                          <div className="text-gray-500 text-sm">{authorHandle}</div>
                        </Link>
                      </div>
                    </div>
                    <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                      <button className="hover:bg-gray-200 rounded-full p-1">
                        <MoreHorizontal size={20} className="text-gray-500" />
                      </button>
                    </Dropdown>
                  </div>
                  {mediaType !== 'book' && (
                    <p className="text-[#1B1C1E] text-justify text-[16px] leading-6 mt-4 mb-6">
                      {originalPost.content}
                    </p>
                  )}

                  {firstMedia && mediaUrl && (
                    <div className="mb-6">
                      {mediaType === 'image' && <PostImageDetail post={originalPost} />}
                      {mediaType === 'book' && <PostLinkDetail post={originalPost} />}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{formattedTime}</span>
                    <span>·</span>
                    <span>{formattedDate}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-around py-4 border-[#8F8E8A] mb-6 bg-[#E8F1FC] px-[22px] py-[24px] border-[1.5px] rounded-[10px] border-[#95ACCC] shadow-[4px_4px_13px_rgba(0,0,0,0.25)]">
              <button
                onClick={handleLike}
                disabled={actionLoading !== null}
                className={`flex items-center gap-2 text-gray-700 hover:text-blue-600 cursor-pointer ${
                  actionLoading === 'like' ? 'opacity-50' : ''
                }`}
              >
                <Heart size={22} className={liked ? 'fill-red-500 text-red-500' : ''} />
                <span>{likesCount}</span>
              </button>
              <button
                onClick={() => {}} 
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 cursor-pointer"
              >
                <MessageCircle size={22} />
                <span>{commentsCount}</span>
              </button>
              <button
                onClick={handleRepost}
                disabled={actionLoading !== null}
                className={`flex items-center gap-2 text-gray-700 hover:text-blue-600 cursor-pointer ${
                  actionLoading === 'repost' ? 'opacity-50' : ''
                }`}
              >
                <Repeat2 size={22} className={reposted ? 'text-[#0B5107]' : ''} />
                <span>{repostsCount}</span>
              </button>
              <button
                onClick={handleBookmark}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 cursor-pointer"
              >
                <Bookmark size={22} className={isBookmarked ? 'fill-[#0B5107] text-[#0B5107]' : ''} />
              </button>
            </div>

            <CommentSection postId={originalPost.id} onCommentPosted={handleCommentPosted} />
          </div>

          <div className="hidden lg:block w-64 shrink-0">
            <TagsSidebar />
          </div>
        </div>
      </main>
      <ReportModal
        open={reportModalOpen}
        postId={originalPost.id}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
}