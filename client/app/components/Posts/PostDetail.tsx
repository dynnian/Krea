import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Grid, message } from "antd";
import { ArrowLeft, Heart, Link2, MessageCircle, Repeat2, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import TagsSidebar from "../Home/TagsSidebar";
import PostImageDetail from "./PostImageDetail";
import PostAudioDetail from "./PostAudioDetail";
import CommentSection from "./CommentSection";
import { PostType } from "../../types/common";
import type { Post } from "../../types/post";
import { postsApi } from "~/services/postsService";

const { useBreakpoint } = Grid;

interface PostDetailProps {
  post: Post;
}

export default function PostDetail({ post }: PostDetailProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Estados locales para interacciones
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [reposted, setReposted] = useState(false);
  const [repostsCount, setRepostsCount] = useState(post.favoritesCount || 0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const formattedTime = post.created_at
    ? new Date(post.created_at).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const requireAuth = () => {
    if (!user) {
      message.warning(t("post.auth_required"));
      navigate("/login");
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth() || actionLoading) return;

    const wasLiked = liked;
    // Optimistic update
    setLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));
    setActionLoading("like");

    try {
      if (wasLiked) {
        await postsApi.unlike(post.id, { postId: post.id, userId: user!.id });
      } else {
        await postsApi.like(post.id, { postId: post.id, userId: user!.id });
      }
    } catch (error) {
      // Revertir en caso de error
      setLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      message.error(t("post.like_error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRepost = async () => {
    if (!requireAuth() || actionLoading) return;

    const wasReposted = reposted;
    setReposted(!wasReposted);
    setRepostsCount((prev) => (wasReposted ? prev - 1 : prev + 1));
    setActionLoading("repost");

    try {
      await postsApi.repost(post.id, {
        authorId: user!.id,
        originalPostId: post.id,
      });
      message.success(t("post.reposted"));
    } catch (error) {
      setReposted(wasReposted);
      setRepostsCount((prev) => (wasReposted ? prev + 1 : prev - 1));
      message.error(t("post.repost_error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleComment = () => {
    if (!requireAuth()) return;
    // Ya existe un CommentSection separado, pero podrías enfocar el input si quisieras
  };

  const handleBookmark = () => {
    if (!requireAuth()) return;
    // Endpoint no disponible en la API actual. Podrías implementar una simulación local
    message.info("Función de guardado no disponible en el backend aún");
  };

  return (
    <div className="min-h-screen bg-[#E3E2DE]">
      <main className="flex justify-center px-2 sm:px-4">
        <div className="flex flex-col md:flex-row gap-6 max-w-7xl w-full">
          {/* Columna principal */}
          <div className="w-full md:w-[740px]">
            <div className="bg-[#E8F1FC] border-l-2 border-r-2 border-[#8F8E8A] px-6 py-6">
              {/* Cabecera con botón de retroceso */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-200 rounded-full transition"
                >
                  <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <h1 className="text-xl font-medium text-gray-800">
                  {t("post.publication")}
                </h1>
              </div>

              {/* Información del autor */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-white rounded-full border border-gray-800 flex items-center justify-center text-2xl">
                    {post.author?.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User size={24} className="text-gray-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {post.author?.name || "Usuario"}
                    </div>
                    <div className="text-gray-500 text-sm">
                      @{post.author?.handle || "usuario"}
                    </div>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-gray-700">
                  <span className="text-2xl">⋯</span>
                </button>
              </div>

              {/* Contenido del post */}
              <div className="mb-6">
                <p className="text-gray-800 text-justify">{post.content}</p>
              </div>

              {/* Media según tipo */}
              {post.type === PostType.IMAGE && <PostImageDetail post={post} />}
              {post.type === PostType.MUSIC && <PostAudioDetail post={post} />}
              {post.type === PostType.TEXT && (
                <div className="mb-6">{/* Solo texto */}</div>
              )}

              {/* Fecha y hora */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <span>{formattedTime}</span>
                <span>·</span>
                <span>{formattedDate}</span>
              </div>

              {/* Barra de interacciones */}
              <div className="flex items-center justify-around py-4 border-t border-b border-[#8F8E8A] mb-6">
                <button
                  className={`flex items-center gap-2 text-gray-700 hover:text-blue-600 ${
                    actionLoading === "like" ? "opacity-50 cursor-wait" : ""
                  }`}
                  onClick={handleLike}
                  disabled={actionLoading !== null}
                >
                  <Heart size={18} className={liked ? "fill-red-500 text-red-500" : ""} />
                  <span>{likesCount}</span>
                </button>

                <button
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                  onClick={handleComment}
                >
                  <MessageCircle size={18} />
                  <span>{post.replies?.length || 0}</span>
                </button>

                <button
                  className={`flex items-center gap-2 text-gray-700 hover:text-blue-600 ${
                    actionLoading === "repost" ? "opacity-50 cursor-wait" : ""
                  }`}
                  onClick={handleRepost}
                  disabled={actionLoading !== null}
                >
                  <Repeat2 size={18} className={reposted ? "text-green-600" : ""} />
                  <span>{repostsCount}</span>
                </button>

                <button
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                  onClick={handleBookmark}
                >
                  <Link2 size={18} />
                </button>
              </div>

              {/* Sección de comentarios */}
              <CommentSection postId={post.id} />
            </div>
          </div>

          {/* Sidebar de tags (solo en desktop) */}
          {!isMobile && (
            <div className="w-full md:w-64 flex-shrink-0">
              <TagsSidebar />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}