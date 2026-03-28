import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { Avatar, Input, Button, message } from 'antd';
import { Heart, MessageCircle, Repeat2, Share2, MoreHorizontal, User } from 'lucide-react';
import { postsApi } from '../../services/postsService';
import type { ReplyDto } from "../../services/comments.ts";

const { TextArea } = Input;

interface CommentSectionProps {
  postId: string;
  initialReplies?: ReplyDto[];
  onNewReply?: () => void;
}

export default function CommentSection({ postId, initialReplies = [], onNewReply }: CommentSectionProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Asegurar que initialReplies sea un array
  const safeInitialReplies = Array.isArray(initialReplies) ? initialReplies : [];
  const [comments, setComments] = useState<ReplyDto[]>(safeInitialReplies);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(safeInitialReplies.length === 0);

  useEffect(() => {
    if (safeInitialReplies.length === 0) {
      const fetchReplies = async () => {
        try {
          const res = await postsApi.getReplies(postId);
          const data = Array.isArray(res.data) ? res.data : [];
          setComments(data);
        } catch (err) {
          console.error(err);
          message.error(t('post.comment_load_error'));
        } finally {
          setLoading(false);
        }
      };
      fetchReplies();
    } else {
      setLoading(false);
    }
  }, [postId, safeInitialReplies, t]);

  const handleSubmit = async () => {
    if (!user) {
      message.warning(t('post.auth_required'));
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    const optimisticComment: ReplyDto = {
      id: `temp-${Date.now()}`,
      authorId: user.id,
      authorName: user.name || user.handle || user.email.split('@')[0],
      content: newComment,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [optimisticComment, ...prev]);
    const originalContent = newComment;
    setNewComment('');

    try {
      const response = await postsApi.replyToPost(postId, {
        authorId: user.id,
        replyToPostId: postId,
        title: '',
        content: originalContent,
      });
      // Reemplazar el comentario optimista por el real
      const newReply = response.data;
      setComments(prev => prev.map(c => c.id === optimisticComment.id ? newReply : c));
      message.success(t('post.comment_success'));
      onNewReply?.();
    } catch (err) {
      // Revertir si falla
      setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
      message.error(t('post.comment_error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-4">{t('common.loading')}</div>;

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <Avatar icon={<User />} size={40} className="bg-white border border-gray-800" />
        <div className="flex-1">
          <TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('post.reply_placeholder') || 'Escribe tu comentario...'}
            autoSize={{ minRows: 2, maxRows: 4 }}
            className="bg-gray-50 rounded-lg p-3"
          />
          <div className="flex justify-end mt-2">
            <Button type="primary" onClick={handleSubmit} loading={submitting} className="bg-[#1351AA]">
              {t('home.post_button')}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar icon={<User />} size={40} className="bg-white border border-gray-800" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-900">{comment.authorName}</span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500">@{comment.authorId.slice(0, 8)}</span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </span>
                <MoreHorizontal size={14} className="text-gray-500 ml-auto" />
              </div>
              <p className="text-gray-800 mt-1">{comment.content}</p>
              <div className="flex items-center gap-4 mt-2 text-gray-600">
                <button className="flex items-center gap-1 hover:text-blue-600">
                  <Heart size={16} />
                  <span className="text-xs">0</span>
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