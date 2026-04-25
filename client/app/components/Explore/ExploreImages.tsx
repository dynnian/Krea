// app/components/Explore/ExploreImages.tsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Spin, message, Modal, Avatar, Dropdown, Button } from "antd";
import { Heart, Bookmark, MessageCircle, Repeat2, MoreHorizontal, User, ArrowLeft, UserPlus, UserCheck } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { postsApi } from "../../services/postsService";
import { userService } from "../../services/userService";
import CommentSection from "../Posts/CommentSection";
import type { ExplorePostDto, PostDto } from "../../types/api";

interface ExploreImagesProps {
  selectedTag?: string | null;
}

const ImageViewerModal: React.FC<{ open: boolean; postId: string | null; onClose: () => void }> = ({ open, postId, onClose }) => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState<PostDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [reposted, setReposted] = useState(false);
  const [repostsCount, setRepostsCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (!open || !postId) return;
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await postsApi.getPost(postId);
        const data = res.data;
        setPost(data);
        setLiked(data.isLikedByCurrentUser);
        setLikesCount(data.likesCount);
        setReposted(data.isRetweetedByCurrentUser);
        setRepostsCount(data.isRetweetedByCurrentUser ? 1 : 0);
        setIsBookmarked((data as any).isFavoritedByCurrentUser ?? false);
        setCommentsCount(data.replies?.length ?? 0);
      } catch (err) {
        console.error(err);
        message.error(t("post.load_error"));
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [open, postId, t]);

  const requireAuth = () => {
    if (!isAuthenticated) {
      message.warning(t("post.auth_required"));
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth() || actionLoading || !post) return;
    setActionLoading("like");
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));
    try {
      if (wasLiked) {
        await postsApi.unlike(post.id, { postId: post.id, userId: user!.id });
      } else {
        await postsApi.like(post.id, { postId: post.id, userId: user!.id });
      }
    } catch {
      setLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      message.error(t("post.like_error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRepost = async () => {
    if (!requireAuth() || actionLoading || !post) return;
    setActionLoading("repost");
    const wasReposted = reposted;
    setReposted(!wasReposted);
    setRepostsCount((prev) => (wasReposted ? prev - 1 : prev + 1));
    try {
      await postsApi.repost(post.id, { authorId: user!.id, originalPostId: post.id });
      message.success(t("post.reposted"));
    } catch {
      setReposted(wasReposted);
      setRepostsCount((prev) => (wasReposted ? prev + 1 : prev - 1));
      message.error(t("post.repost_error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleBookmark = async () => {
    if (!requireAuth() || !post) return;
    try {
      await postsApi.toggleFavorite(post.id);
      setIsBookmarked((prev) => !prev);
      message.success(t("post.bookmark_toggled"));
    } catch {
      message.error(t("post.bookmark_error"));
    }
  };

  const handleFollow = async () => {
    if (!requireAuth() || !post) return;
    const wasFollowing = following;
    setFollowing(!wasFollowing);
    try {
      if (wasFollowing) {
        await userService.unfollow(post.authorPostId);
      } else {
        await userService.follow(post.authorPostId);
      }
      message.success(wasFollowing ? t("profile.unfollowed") : t("profile.followed"));
    } catch {
      setFollowing(wasFollowing);
      message.error(t("profile.follow_error"));
    }
  };

  const handleCommentPosted = () => {
    setCommentsCount((prev) => prev + 1);
  };

  if (!post) return null;

  const authorAvatar = post.author?.avatar ?? post.authorProfilePictureUrl;
  const isOwnPost = user?.id === post.authorPostId;

  return (
    <Modal open={open} onCancel={onClose} footer={null} width="90%" style={{ maxWidth: 1200 }} bodyStyle={{ padding: 0 }} closeIcon={<ArrowLeft size={24} />}>
      {loading ? (
        <div className="flex justify-center p-20"><Spin /></div>
      ) : (
        <div className="flex flex-col md:flex-row min-h-[80vh] bg-[#E3E2DE]">
          <div className="md:w-3/5 bg-black flex items-center justify-center p-4">
            {post.media?.[0]?.url ? (
              <img src={post.media[0].url} alt={post.title} className="max-w-full max-h-[80vh] object-contain" />
            ) : (
              <div className="text-white">{t("common.no_image")}</div>
            )}
          </div>
          <div className="md:w-2/5 bg-[#E8F1FC] p-5 flex flex-col overflow-auto">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <Avatar src={authorAvatar} icon={<User />} size={48} className="bg-white border border-black rounded-full" />
                <div>
                  <div className="font-medium text-[#1B1C1E]">{post.authorName || `Usuario ${post.authorPostId.slice(0, 8)}`}</div>
                  <div className="text-gray-500 text-sm">@{post.authorName || post.authorPostId.slice(0, 8)}</div>
                </div>
              </div>
              <div className="flex gap-2">
                {!isOwnPost && (
                  <Button size="small" onClick={handleFollow} icon={following ? <UserCheck size={14} /> : <UserPlus size={14} />}>
                    {following ? t("profile.unfollow") : t("profile.follow")}
                  </Button>
                )}
                <Dropdown menu={{ items: [{ key: "report", label: t("post.report") }] }} trigger={["click"]}>
                  <button className="hover:bg-gray-200 rounded-full p-1">
                    <MoreHorizontal size={20} className="text-gray-500" />
                  </button>
                </Dropdown>
              </div>
            </div>
            <h2 className="text-xl font-bold mt-4 text-[#1B1C1E]">{post.title}</h2>
            <p className="text-[#1B1C1E] text-justify text-[16px] leading-6 mt-2">{post.content}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
              <span>{new Date(post.uploadedAt).toLocaleTimeString()}</span>
              <span>·</span>
              <span>{new Date(post.uploadedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-around py-4 border-[#8F8E8A] my-4 bg-[#E8F1FC] px-4 border rounded-lg">
              <button onClick={handleLike} disabled={actionLoading !== null} className={`flex items-center gap-2 text-gray-700 hover:text-blue-600 ${actionLoading === "like" ? "opacity-50" : ""}`}>
                <Heart size={22} className={liked ? "fill-red-500 text-red-500" : ""} />
                <span>{likesCount}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                <MessageCircle size={22} />
                <span>{commentsCount}</span>
              </button>
              <button onClick={handleRepost} disabled={actionLoading !== null} className={`flex items-center gap-2 text-gray-700 hover:text-blue-600 ${actionLoading === "repost" ? "opacity-50" : ""}`}>
                <Repeat2 size={22} className={reposted ? "text-[#0B5107]" : ""} />
                <span>{repostsCount}</span>
              </button>
              <button onClick={handleBookmark} className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                <Bookmark size={22} className={isBookmarked ? "fill-[#0B5107] text-[#0B5107]" : ""} />
              </button>
            </div>
            <CommentSection postId={post.id} onCommentPosted={handleCommentPosted} />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default function ExploreImages({ selectedTag }: ExploreImagesProps) {
  const { t } = useTranslation();
  const [images, setImages] = useState<ExplorePostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const tags = selectedTag ? [selectedTag] : undefined;
        const res = await postsApi.explore({ category: "Image", tags, pageSize: 30 });
        setImages(res.data.items || []);
      } catch (err) {
        console.error(err);
        message.error(t("common.error"));
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [selectedTag, t]);

  if (loading) return <div className="flex justify-center p-20"><Spin size="large" /></div>;

  return (
    <>
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] px-4 md:px-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[1px] bg-[#E3E2DE]">
          {images.map((img) => (
            <div key={img.id} className="aspect-square overflow-hidden bg-white cursor-pointer" onClick={() => { setSelectedPostId(img.id); setModalOpen(true); }}>
              <img src={img.previewUrl || "https://placehold.co/400x400"} alt={img.title} className="w-full h-full object-cover hover:scale-105 transition" />
            </div>
          ))}
        </div>
      </div>
      <ImageViewerModal open={modalOpen} postId={selectedPostId} onClose={() => setModalOpen(false)} />
    </>
  );
}