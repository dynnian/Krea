// deno-lint-ignore-file
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Avatar, Dropdown, message, Spin } from "antd";
import { X } from "lucide-react";
import {
  Bookmark,
  Flag,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  User,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.tsx";
import { postsApi } from "../services/postsService.ts";
import type { PostDto } from "../types/api.ts";
import CommentSection from "../components/Posts/CommentSection.tsx";
import ReportModal from "../components/Reports/ReportModal.tsx";

const getAuthorAvatar = (post: any) =>
  post.author?.avatar ??
  post.author?.profilePictureUrl ??
  post.authorProfilePictureUrl ??
  post.profilePictureUrl ??
  null;

export default function ImageView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const postId = searchParams.get("image") ?? searchParams.get("id");

  const [post, setPost] = useState<PostDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [reposted, setReposted] = useState(false);
  const [repostsCount, setRepostsCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    console.log("ImageView mounted with postId:", postId);

    if (!postId) {
      setLoading(false);
      return;
    }
    const loadPost = async () => {
      setLoading(true);

      try {
        console.log("ImageView loading postId:", postId);
console.log("About to fetch post:", postId);
const response = await postsApi.getPost(postId);
console.log("Post response:", response);
        const postData = response.data ?? response;

        setPost(postData);
        setLiked(postData.isLikedByCurrentUser ?? false);
        setLikesCount(postData.likesCount ?? 0);
        setReposted(postData.isRetweetedByCurrentUser ?? false);
        setRepostsCount(postData.isRetweetedByCurrentUser ? 1 : 0);
        setCommentsCount(postData.replies?.length ?? 0);
        setIsBookmarked(
          (postData as any).isFavoritedByCurrentUser ??
            (postData as any).isFavorite ??
            false
        );
      } catch (error) {
        console.error("Error loading image view post:", error);
        message.error("No se pudo cargar la imagen.");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  const originalPost = post?.repostOf ?? post;
  const isOwnPost = !!originalPost && user?.id === originalPost.authorPostId;

  const requireAuth = () => {
    if (!user) {
      message.warning("Debes iniciar sesión.");
      navigate("/login");
      return false;
    }

    return true;
  };

  const handleLike = async () => {
    if (!requireAuth() || actionLoading || !originalPost) return;

    setActionLoading("like");
    const wasLiked = liked;

    setLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      if (wasLiked) {
        await postsApi.unlike(originalPost.id, {
          postId: originalPost.id,
          userId: user!.id,
        });
      } else {
        await postsApi.like(originalPost.id, {
          postId: originalPost.id,
          userId: user!.id,
        });
      }
    } catch {
      setLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      message.error("No se pudo actualizar el like.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRepost = async () => {
    if (!requireAuth() || actionLoading || !originalPost) return;

    setActionLoading("repost");
    const wasReposted = reposted;

    setReposted(!wasReposted);
    setRepostsCount((prev) => (wasReposted ? prev - 1 : prev + 1));

    try {
      await postsApi.repost(originalPost.id, {
        authorId: user!.id,
        originalPostId: originalPost.id,
      });
    } catch {
      setReposted(wasReposted);
      setRepostsCount((prev) => (wasReposted ? prev + 1 : prev - 1));
      message.error("No se pudo repostear.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBookmark = async () => {
    if (!requireAuth() || !originalPost) return;

    const wasBookmarked = isBookmarked;
    setIsBookmarked(!wasBookmarked);

    try {
      await postsApi.toggleFavorite(originalPost.id);
    } catch {
      setIsBookmarked(wasBookmarked);
      message.error("No se pudo actualizar el guardado.");
    }
  };

  const handleReportClick = () => {
    if (!requireAuth() || !originalPost) return;

    if (isOwnPost) {
      message.warning("No puedes reportar tu propia publicación.");
      return;
    }

    setReportModalOpen(true);
  };

  const handleCommentPosted = () => {
    setCommentsCount((prev) => prev + 1);
  };

  if (loading) {
    return (
      
      <div className="fixed inset-0 z-[1000] bg-black/70 flex items-center justify-center">

        <Spin size="large" />
      </div>
    );
  }

  if (!originalPost) {
    return (
      <div
        className="fixed inset-0 z-[1000] bg-black/70 text-white flex items-center justify-center"
        onClick={() => navigate(-1)}
      >
        No se encontró la publicación.
      </div>
    );
  }

  const images = (originalPost.media ?? []).filter((media: any) =>
    (media.mimeType ?? "").startsWith("image")
  );

  const activeImage = images[0];
  const imageUrl = activeImage?.url;

  const formattedDate = new Date(originalPost.uploadedAt).toLocaleDateString(
    "es-ES",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  const formattedTime = new Date(originalPost.uploadedAt).toLocaleTimeString(
    "es-ES",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const authorName =
    originalPost.authorName ||
    (originalPost as any).authorUsername ||
    `Usuario ${originalPost.authorPostId?.slice(0, 8) ?? ""}`;

  const authorHandle =
    originalPost.authorName ||
    (originalPost as any).authorUsername ||
    originalPost.authorPostId?.slice(0, 8) ||
    "Dominio";

  const authorAvatar = getAuthorAvatar(originalPost);

  const menuItems = isOwnPost
    ? []
    : [
        {
          key: "report",
          label: "Reportar",
          icon: <Flag size={16} />,
          onClick: handleReportClick,
        },
      ];

  return (
  <div
    className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm overflow-y-auto"
    onClick={() => navigate(-1)}
  >
  <div className="min-h-full flex items-start">
    <button
      onClick={() => navigate(0)}
      className="sticky top-4 left-4 z-[1100] w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition cursor-pointer"
    >
      <X className="text-white" size={20} />
    </button>
      <section className="flex-1 min-w-0 sticky -left-5 top-0 h-screen flex items-center justify-center px-8 py-6">
        
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={originalPost.title ?? ""}
            className="max-h-[92vh] max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        ) : (
          <p className="text-white">Esta publicación no tiene imagen.</p>
        )}
      </section>

      <aside
        className="w-[440px] min-h-screen text-[#1B1C1E] flex flex-col py-3 pr-3"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="bg-[#E8F1FC] rounded-[10px] outline outline-[1.5px] outline-[#95ACCC] shadow-[4px_4px_13px_rgba(0,0,0,0.25)] p-[20px] cursor-pointer mb-[11px]"
          onClick={() => navigate(`/post/${originalPost.id}`)}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3">
              <Avatar
                src={authorAvatar ?? undefined}
                icon={!authorAvatar && <User />}
                size={48}
                className="bg-white border border-black rounded-full"
              />

              <div>
                <Link
                  to={`/user/${originalPost.authorPostId}`}
                  onClick={(event) => event.stopPropagation()}
                  className="hover:text-[#1351AA]"
                >
                  <div className="font-medium text-[14px] leading-[16px]">
                    {authorName}
                  </div>
                  <div className="text-[12px] text-[#1B1C1E]/70">
                    @{authorHandle}
                  </div>
                </Link>
              </div>
            </div>

            <Dropdown
              menu={{ items: menuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <button
                type="button"
                onClick={(event) => event.stopPropagation()}
                className="hover:bg-black/5 rounded-full p-1"
              >
                <MoreHorizontal size={20} />
              </button>
            </Dropdown>
          </div>

          <h1 className="text-[26px] font-bold leading-[26px] mb-3">
            {originalPost.title}
          </h1>

          <p className="text-[15px] leading-[21px] text-justify">
            {originalPost.content}
          </p>

          <div className="flex items-center gap-2 text-[12px] mt-5">
            <span>{formattedTime}</span>
            <span>·</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center justify-around py-4 border-[#8F8E8A] mb-[11px] bg-[#E8F1FC] px-[22px] py-[14px] border-[1.5px] rounded-[10px] border-[#95ACCC] shadow-[4px_4px_13px_rgba(0,0,0,0.25)]">
          <button
            type="button"
            onClick={handleLike}
            disabled={actionLoading !== null}
            className="flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Heart
              size={21}
              className={liked ? "fill-[#0B5107] text-[#0B5107]" : ""}
            />
            <span className="text-[12px]">{likesCount}</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1 cursor-pointer"
          >
            <MessageCircle size={21} />
            <span className="text-[12px]">{commentsCount}</span>
          </button>

          <button
            type="button"
            onClick={handleRepost}
            disabled={actionLoading !== null}
            className="flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Repeat2
              size={21}
              className={reposted ? "text-[#0B5107]" : ""}
            />
            <span className="text-[12px]">{repostsCount}</span>
          </button>

          <button
            type="button"
            onClick={handleBookmark}
            className="flex items-center justify-center cursor-pointer"
          >
            <Bookmark
              size={21}
              className={isBookmarked ? "fill-[#0B5107] text-[#0B5107]" : ""}
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <CommentSection
            postId={originalPost.id}
            onCommentPosted={handleCommentPosted}
          />
        </div>
      </aside>

      </div>

      <ReportModal
        open={reportModalOpen}
        postId={originalPost.id}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
}