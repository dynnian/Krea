import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, UserPlus, UserCheck, Clock, Heart, Image, FileText, Video } from "lucide-react";
import { Avatar, Spin, message } from "antd";
import { searchApi, type UserSearchItem, type PostSearchItem } from "../services/searchService";
import { userService } from "../services/userService.ts";
import { useAuth } from "../contexts/AuthContext.tsx";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserSearchItem[]>([]);
  const [posts, setPosts] = useState<PostSearchItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce para evitar muchas llamadas
  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      setPosts([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async () => {
    if (!query.trim()) return;
    setLoadingUsers(true);
    setLoadingPosts(true);
    setHasSearched(true);
    try {
      const [usersRes, postsRes] = await Promise.all([
        searchApi.searchUsers(query, 1, 5),  // limitar a 5 resultados por sección
        searchApi.searchPosts(query, 1, 5),
      ]);
      setUsers(usersRes.data.items);
      setPosts(postsRes.data.items);
    } catch (error) {
      console.error(error);
      message.error(t("search.error"));
    } finally {
      setLoadingUsers(false);
      setLoadingPosts(false);
    }
  };

  const handleFollowToggle = async (targetUserId: string, isCurrentlyFollowing: boolean) => {
    if (!isAuthenticated) {
      message.warning(t("profile.login_to_follow"));
      return;
    }
    // Optimistic update
    setUsers(prev =>
      prev.map(u =>
        u.id === targetUserId ? { ...u, isFollowing: !isCurrentlyFollowing } : u
      )
    );
    try {
      if (isCurrentlyFollowing) {
        await userService.unfollow(targetUserId);
      } else {
        await userService.follow(targetUserId);
      }
    } catch {
      // revert
      setUsers(prev =>
        prev.map(u =>
          u.id === targetUserId ? { ...u, isFollowing: isCurrentlyFollowing } : u
        )
      );
      message.error(t("profile.follow_error"));
    }
  };

  const getPostTypeIcon = (type: string) => {
    if (type === "Image") return <Image size={14} />;
    if (type === "Text") return <FileText size={14} />;
    return <Video size={14} />;
  };

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Auto focus al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setUsers([]);
      setPosts([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      {/* Fondo oscuro */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/10"
      >
        {/* Header con input */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-[#1351AA]">
          <Search className="text-white/70" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder={t("search.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 text-base py-2 outline-none text-white placeholder:text-white/50"
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70"
          >
            <X size={20} />
          </button>
        </div>

        {/* Resultados */}
        <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
          {!query.trim() ? (
            <div className="text-center py-12 text-gray-400">
              <Search className="mx-auto mb-3 opacity-20" size={48} />
              <p>{t("search.start_typing")}</p>
            </div>
          ) : hasSearched && (loadingUsers || loadingPosts) ? (
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : (users.length === 0 && posts.length === 0) ? (
            <div className="text-center py-12 text-gray-400">
              <p>{t("search.no_results", { query })}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Sección Usuarios */}
              {users.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
                    {t("search.users")}
                  </h3>
                  <div className="space-y-3">
                    {users.map((userItem) => (
                      <div
                        key={userItem.id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50/50 group transition-all border border-transparent hover:border-blue-100 cursor-pointer"
                        onClick={() => {
                          navigate(`/user/${userItem.id}`);
                          onClose();
                        }}
                      >
                        <Avatar
                          src={userItem.profilePictureUrl || undefined}
                          size={48}
                          className="border-2 border-white shadow-sm"
                        >
                          {userItem.displayName.charAt(0).toUpperCase()}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-gray-800 truncate">
                            {userItem.displayName}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            @{userItem.username}
                          </p>
                          {userItem.biography && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {userItem.biography}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollowToggle(userItem.id, userItem.isFollowing);
                          }}
                          className="p-2 text-[#1351AA] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {userItem.isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Sección Publicaciones */}
              {posts.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
                    {t("search.posts")}
                  </h3>
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="flex gap-4 p-4 rounded-xl hover:bg-blue-50/50 transition-all border border-transparent hover:border-blue-100 cursor-pointer bg-gray-50/30"
                        onClick={() => {
                          navigate(`/post/${post.id}`);
                          onClose();
                        }}
                      >
                        {/* Miniatura para imágenes */}
                        {post.postType === "Image" && post.previewUrl && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                            <img
                              src={post.previewUrl}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar
                              src={post.authorProfilePictureUrl || undefined}
                              size={20}
                              className="border border-white"
                            />
                            <span className="text-[10px] font-medium text-gray-600">
                              {post.authorName}
                            </span>
                            <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(post.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-gray-800 mb-1 line-clamp-1">
                            {post.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {post.content}
                          </p>
                          <div className="mt-2 flex items-center gap-3 text-[10px] font-medium text-gray-500">
                            <span className="flex items-center gap-1">
                              <Heart size={12} /> {post.likesCount} {t("common.likes")}
                            </span>
                            <span className="bg-blue-100 text-[#1351AA] px-2 py-0.5 rounded text-[9px] uppercase font-bold flex items-center gap-1">
                              {getPostTypeIcon(post.postType)} {post.postType}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Footer con información */}
        <div className="p-3 bg-[#1351AA] border-t border-white/10 flex justify-between items-center text-[10px] text-blue-100 font-medium">
          <p>{t("search.esc_to_close")}</p>
          <p>{t("search.community_results")}</p>
        </div>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}