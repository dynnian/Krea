import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Avatar, message } from "antd";
import { Heart, MessageCircle, Repeat2, Bookmark, Link2, MoreHorizontal, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import AudioWaveform from "../WaveSurfer/AudioWaveform";
import { PostType } from "../../types/common";
import type { Post } from "../../types/post";

interface PostCardProps {
  post: Post;
  onLike?: (postId: number) => Promise<void>;
  onComment?: (postId: number) => void;
  onRepost?: (postId: number) => Promise<void>;
  onBookMark?: (postId: number) => void;
}

export default function PostCard({
  post,
  onLike,
  onComment,
  onRepost,
  onBookMark,
}: PostCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [liked, setLiked] = useState( false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [reposted, setReposted] = useState( false);
  const [repostsCount, setRepostsCount] = useState(post.favoritesCount || 0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const requireAuth = () => {
    if (!user) {
      message.warning(t("post.auth_required"));
      navigate("/login");
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth()) return;
    if (actionLoading) return;

    setActionLoading("like");
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      if (onLike) {
        await onLike(post.id);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
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
    if (!requireAuth()) return;
    if (actionLoading) return;

    setActionLoading("repost");
    const wasReposted = reposted;
    setReposted(!wasReposted);
    setRepostsCount((prev) => (wasReposted ? prev - 1 : prev + 1));

    try {
      if (onRepost) {
        await onRepost(post.id);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch {
      setReposted(wasReposted);
      setRepostsCount((prev) => (wasReposted ? prev + 1 : prev - 1));
      message.error(t("post.repost_error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleComment = () => {
    if (!requireAuth()) return;
    if (onComment) {
      onComment(post.id);
    } else {
      navigate(`/post/${post.id}`);
    }
  };

  const handleBookMark = () => {
    if (onBookMark) {
      onBookMark(post.id);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      message.success(t("post.link_copied"));
    }
  };

  const firstUpload = post.media && post.media.length > 0 ? post.media[0] : undefined;
  const mediaUrl = firstUpload?.media?.path;
  const mediaType = post.type;

  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
    : "";

  return (
    <article className="flex flex-col w-full gap-3 p-4 bg-[#E8F1FC] border-t border-gray">
      <div className="flex gap-3">
        <Avatar
          src={post.author?.avatar}
          icon={!post.author?.avatar &&  <User />}
          size={48}
          className="bg-white border border-gray-800"
        />
        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-medium text-gray-900">{post.author?.name || "Usuario"}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">@{post.author?.handle || "usuario"}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">{formattedDate}</span>
            <MoreHorizontal size={16} className="text-gray-500 ml-auto" />
          </div>
          <p className="text-gray-800 mt-1">{post.content}</p>
        </div>
      </div>

      {firstUpload && mediaUrl && mediaType && (
        <div className="ml-0 sm:ml-[60px] mt-2">
          {mediaType === PostType.IMAGE && (
            <img
              src={mediaUrl}
              alt="Image"
              className="w-full max-h-80 object-cover rounded-lg border border-gray-200"
            />
          )}
          {mediaType === PostType.LINK && (
            <div className="bg-[#F3F3F1] p-4 rounded-lg border border-[#8F8E8A]">
              <Link2 size={18} className="mr-2 inline" />
              <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {mediaUrl}
              </a>
            </div>
          )}
          {mediaType === PostType.AUDIO && (
            <div className="bg-[#F3F3F1] p-4 rounded-lg border border-[#8F8E8A]">
              <AudioWaveform audioUrl={mediaUrl} />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-6 ml-0 sm:ml-[60px] mt-2 text-gray-600">
        <button
          className={`flex items-center gap-1 hover:text-blue-600 transition ${
            actionLoading === "like" ? "opacity-50 cursor-wait" : ""
          }`}
          onClick={handleLike}
          disabled={actionLoading !== null}
        >
          <Heart size={18} className={liked ? "fill-red-500 text-red-500" : ""} />
          <span className="text-sm">{likesCount}</span>
        </button>
        <button className="flex items-center gap-1 hover:text-blue-600" onClick={handleComment}>
          <MessageCircle size={18} />
          <span className="text-sm">{post.replies?.length || 0}</span>
        </button>
        <button
          className={`flex items-center gap-1 hover:text-blue-600 ${
            actionLoading === "repost" ? "opacity-50 cursor-wait" : ""
          }`}
          onClick={handleRepost}
          disabled={actionLoading !== null}
        >
          <Repeat2 size={18} className={reposted ? "text-green-600" : ""} />
          <span className="text-sm">{repostsCount}</span>
        </button>
        <button className="flex items-center gap-1 hover:text-blue-600" onClick={handleBookMark}>
          <Bookmark size={18} />
        </button>
      </div>
    </article>
  );
}