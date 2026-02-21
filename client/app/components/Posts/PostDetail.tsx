import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Grid } from "antd";
import { ArrowLeft, Heart, Link2, MessageCircle, Repeat2, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import TagsSidebar from "../Home/TagsSidebar";
import PostImageDetail from "./PostImageDetail";
import PostAudioDetail from "./PostAudioDetail";
import PostLinkDetail from "./PostLinkDetail";
import CommentSection from "./CommentSection";
import { PostType } from "../../types/common";
import type { Post } from "../../types/post";

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
              {post.type === PostType.AUDIO && <PostAudioDetail post={post} />}
              {post.type === PostType.LINK && <PostLinkDetail post={post} />}
              {post.type === PostType.TEXT && (
                <div className="mb-6">{/* Solo texto, no hay media adicional */}</div>
              )}

              {/* Fecha y hora */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <span>{formattedTime}</span>
                <span>·</span>
                <span>{formattedDate}</span>
              </div>

              {/* Barra de interacciones (like, comment, repost, share) */}
              <div className="flex items-center justify-around py-4 border-t border-b border-[#8F8E8A] mb-6">
                <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                  <Heart size={18} />
                  <span>{post.likesCount || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                  <MessageCircle size={18} />
                  <span>{post.replies?.length || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                  <Repeat2 size={18} />
                  <span>{post.favoritesCount || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
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