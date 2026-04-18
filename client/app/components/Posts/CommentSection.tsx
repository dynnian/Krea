import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { Avatar, Input, Button, message } from 'antd';
import { Heart, MessageCircle, Repeat2, Share2, MoreHorizontal, User } from 'lucide-react';
import { postsApi } from '../../services/postsService';
import type { ReplyDto } from '../../services/comments';
import axiosClient from '../../lib/axios';
import type { UserProfileResponse } from '../../types/api';

const { TextArea } = Input;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5101';

const toAbsoluteUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
};

interface CommentSectionProps {
  postId: string;
  onCommentPosted?: () => void;
}

export default function CommentSection({ postId, onCommentPosted }: CommentSectionProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [comments, setComments] = useState<ReplyDto[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [composerDisplayName, setComposerDisplayName] = useState('');
  const [composerHandle, setComposerHandle] = useState('');
  const [composerAvatarUrl, setComposerAvatarUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!user) {
      setComposerDisplayName('');
      setComposerHandle('');
      setComposerAvatarUrl(undefined);
      return;
    }

    setComposerDisplayName(user.name || user.handle || user.email.split('@')[0]);
    setComposerHandle(user.handle || user.email.split('@')[0]);
    setComposerAvatarUrl(undefined);

    const fetchComposerProfile = async () => {
      try {
        const { data } = await axiosClient.get<UserProfileResponse>('/users/me/profile');
        setComposerDisplayName(data.displayName || user.name || user.handle || user.email.split('@')[0]);
        setComposerHandle(data.username || user.handle || user.email.split('@')[0]);
        setComposerAvatarUrl(toAbsoluteUrl(data.profilePictureUrl));
      } catch {
        // Keep auth-context fallbacks when profile fetch is unavailable.
      }
    };

    fetchComposerProfile();
  }, [user]);

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const res = await postsApi.getReplies(postId);
        // Acceder a la propiedad 'flat' del objeto retornado por la API
        const data = res.data?.flat?.items ?? [];
        setComments(data);
      } catch (err) {
        console.error(err);
        message.error(t('post.comment_load_error'));
      } finally {
        setLoading(false);
      }
    };
    fetchReplies();
  }, [postId, t]);

  const handleSubmit = async () => {
    if (!user) {
      message.warning(t('post.auth_required'));
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    const title = newComment.trim().slice(0, 50) || 'Comentario';
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
      await postsApi.replyToPost(postId, {
        authorId: user.id,
        replyToPostId: postId,
        title: title,
        content: originalContent,
      });
      message.success(t('post.comment_success'));
      onCommentPosted?.();
    } catch (err) {
      // Revertir optimismo
      setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
      message.error(t('post.comment_error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-4">{t('common.loading')}</div>;

  return (
    <div>
      <div className="flex gap-3 mb-6 bg-[#E8F1FC] px-[22px] py-[15px] border-[1.5px] rounded-[10px] border-[#95ACCC] shadow-[4px_4px_13px_rgba(0,0,0,0.25)]">
        <Avatar src={composerAvatarUrl} icon={!composerAvatarUrl && <User />} size={40} className="bg-white border border-gray-800" />
        <div className="flex-1">
          {user && (
            <div className="mb-2">
              <div className="font-medium text-[#1B1C1E] leading-tight">
                {composerDisplayName || user.name || user.handle || user.email.split('@')[0]}
              </div>
              <div className="text-gray-500 text-sm leading-tight">
                @{composerHandle || user.handle || user.email.split('@')[0]}
              </div>
            </div>
          )}
          <TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('post.reply_placeholder') || 'Escribe tu comentario...'}
            autoSize={{ minRows: 2, maxRows: 4 }}
            className="!bg-transparent !border-none !shadow-none !resize-none "
          />
          <div className="flex justify-end mt-2 ">
            <Button type="primary" onClick={handleSubmit} loading={submitting} className="bg-[#1351AA]">
              {t('home.post_button')}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 bg-[#E8F1FC] p-[22px] border-[1.5px] rounded-[10px] border-[#95ACCC] shadow-[4px_4px_13px_rgba(0,0,0,0.25)]">
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