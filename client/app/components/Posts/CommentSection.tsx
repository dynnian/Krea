import { useState,useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router";
import { Avatar, Input, Button, message } from "antd";
import { Heart, MessageCircle, Repeat2, Share2, MoreHorizontal, User } from "lucide-react";

const { TextArea } = Input;

// Tipo de comentario (similar a Post pero más simple)
interface Comment {
  id: number;
  author: {
    name: string;
    handle: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
}

interface CommentSectionProps {
  postId: string;
}

// Datos mock de comentarios
const mockComments: Comment[] = [
  {
    id: 1,
    author: { name: "Usuario", handle: "usuario1", avatar: undefined },
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    createdAt: "15 oct.",
    likes: 3,
  },
  // más comentarios...
];

export default function CommentSection({ postId }: CommentSectionProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        const data = await fetchComments(postId);
        setComments(data);
      } catch (err) {
        setError(err.message);
        message.error(t("post.comments_load_error"));
      } finally {
        setLoading(false);
      }
    };
    loadComments();
  }, [postId, t]);

  const handleSubmit = async () => {
  if (!user) {
    message.warning(t("post.auth_required"));
    navigate("/login");
    return;
  }
  if (!newComment.trim()) return;

  // Optimistic update
  const tempComment: Comment = {
    id: Date.now(), // temporal
    author: {
      name: user.name || "Usuario",
      handle: user.email?.split("@")[0] || "usuario",
      avatar: user.avatar,
    },
    content: newComment,
    createdAt: new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    }),
    likes: 0,
  };
  setComments(prev => [tempComment, ...prev]);
  setNewComment("");
  setSubmitting(true);

  try {
    const created = await createComment(postId, newComment);
    // Reemplazar temporal por el real
    setComments(prev => prev.map(c => c.id === tempComment.id ? created : c));
    message.success(t("post.comment_success"));
  } catch (err) {
    // Revertir
    setComments(prev => prev.filter(c => c.id !== tempComment.id));
    message.error(t("post.comment_error"));
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div>
      {/* Formulario de nuevo comentario */}
      <div className="flex gap-3 mb-6">
        <Avatar
          src={user?.avatar}
          icon={!user?.avatar && <User />}
          size={40}
          className="bg-white border border-gray-800"
        />
        <div className="flex-1">
          <TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t("post.reply_placeholder") || "Responde!"}
            autoSize={{ minRows: 2, maxRows: 4 }}
            className="bg-gray-50 rounded-lg p-3"
          />
          <div className="flex justify-end mt-2">
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={submitting}
              className="bg-[#1351AA]"
            >
              {t("home.post_button")}
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar
              src={comment.author.avatar}
              icon={!comment.author.avatar && <User />}
              size={40}
              className="bg-white border border-gray-800"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-900">
                  {comment.author.name}
                </span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500">@{comment.author.handle}</span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500">{comment.createdAt}</span>
                <MoreHorizontal size={14} className="text-gray-500 ml-auto" />
              </div>
              <p className="text-gray-800 mt-1">{comment.content}</p>
              <div className="flex items-center gap-4 mt-2 text-gray-600">
                <button className="flex items-center gap-1 hover:text-blue-600">
                  <Heart size={16} />
                  <span className="text-xs">{comment.likes}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-blue-600">
                  <MessageCircle size={16} />
                </button>
                <button className="flex items-center gap-1 hover:text-blue-600">
                  <Repeat2 size={16} />
                </button>
                <button className="flex items-center gap-1 hover:text-blue-600">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}