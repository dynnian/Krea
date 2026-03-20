// profile.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, Tabs, Typography, Grid, message, Spin, Input } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import axiosClient from "../lib/axios";
import { postsApi } from "../services/postsService";
import type { ApiPost, UploadMediaType, UserDto } from "../types/api";
import DigitalPortfolio from "../components/Profile/DigitalPortfolio";
import MusicPortfolio from "../components/Profile/MusicPortfolio";
import { digitalPortfolioMock } from "../data/digitalPortfolioMock";
import WriterPortfolio from "../components/Profile/WriterPortfolio";
import { settingsRepository } from "../services/settingsRepository";
import CreatePortfolioPostModal from "../components/Posts/CreatePortfolioPostModal";


import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  MoreHorizontal,
  User,
  Check,
  Play,
  Pause,
  Edit,
} from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

// ---------- Tipos (basados en el backend) ----------
export enum PostType {
  IMAGE = 'image',
  AUDIO = 'audio',
  LINK = 'link',
  TEXT = 'text',
}

interface Author {
  id?: string;
  name: string;
  handle: string;
  avatar?: string;
  isVerified?: boolean;
}

interface Media {
  id: string;
  originalFileName: string;
  fileName: string;
  mimeType: string;
  path: string;
  uploadedAt: string;
}

interface PostMedia {
  postId: string;
  mediaId: string;
  isWorkMedia: boolean;
  media: Media;
}

interface Post {
  id: string;
  userPostId: string;
  type: PostType;
  title: string | null;
  content: string;
  isWork: boolean;
  isDeleted: boolean;
  isLocal: boolean;
  postRepliedTo: string | null;
  postRepostOf: string | null;
  createdAt: string;
  updatedAt: string;
  author: Author;
  media: PostMedia[];
  likesCount: number;
  favoritesCount: number;
  replies: any[];
}

interface ProfileData {
  user: Author;
  bio: string;
  languageCode: string;
  timeZoneId: string;
  followingCount: number;
  followersCount: number;
  isFollowing?: boolean;
  isSubscribed?: boolean;
  posts: Post[];
}

type PublicUserProfileResponse = {
  id: string;
  username: string;
  displayName: string;
  biography: string | null;
  languageCode: string;
  timeZoneId: string;
};

type BackendPostMedia = {
  id?: string;
  fileName?: string;
  mimeType?: string;
  url?: string;
  isWorkMedia?: boolean;
};

type BackendProfilePost = {
  postId?: string;
  authorPostId?: string;
  type?: number;
  title?: string | null;
  content?: string | null;
  isWork?: boolean;
  isDeleted?: boolean;
  isLocal?: boolean;
  postRepliedTo?: string | null;
  postRepostOf?: string | null;
  createdAt?: string;
  updatedAt?: string;
  media?: BackendPostMedia[];
  // shape alterno del backend actual (PostDto)
  id?: string;
  userId?: string;
  authorUsername?: string;
};

function isGuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function mapApiTypeToProfilePostType(type: number): PostType {
  if (type === 2) return PostType.IMAGE;
  if (type === 3) return PostType.AUDIO;
  if (type === 1) return PostType.TEXT;
  return PostType.TEXT;
}

function normalizeMediaUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? ""}${url}`;
}

function mapApiPostToProfilePost(apiPost: BackendProfilePost, author: Author): Post {
  const mappedMedia: PostMedia[] = (apiPost.media ?? []).map((mediaItem) => ({
    postId: String(apiPost.postId ?? apiPost.id ?? ""),
    mediaId: String(mediaItem.id ?? ""),
    isWorkMedia: Boolean(mediaItem.isWorkMedia),
    media: {
      id: String(mediaItem.id ?? ""),
      originalFileName: mediaItem.fileName ?? "",
      fileName: mediaItem.fileName ?? "",
      mimeType: mediaItem.mimeType ?? "",
      path: normalizeMediaUrl(mediaItem.url),
      uploadedAt: String(apiPost.createdAt ?? new Date().toISOString()),
    },
  }));

  const mediaMime = mappedMedia[0]?.media.mimeType ?? "";
  const inferredType =
    typeof apiPost.type === "number"
      ? mapApiTypeToProfilePostType(apiPost.type)
      : mediaMime.startsWith("image/")
      ? PostType.IMAGE
      : mediaMime.startsWith("audio/")
      ? PostType.AUDIO
      : PostType.TEXT;

  return {
    id: String(apiPost.postId ?? apiPost.id ?? ""),
    userPostId: String(apiPost.authorPostId ?? apiPost.userId ?? author.id ?? ""),
    type: inferredType,
    title: apiPost.title ?? null,
    content: apiPost.content ?? "",
    isWork: Boolean(apiPost.isWork),
    isDeleted: Boolean(apiPost.isDeleted),
    isLocal: Boolean(apiPost.isLocal),
    postRepliedTo: apiPost.postRepliedTo ?? null,
    postRepostOf: apiPost.postRepostOf ?? null,
    createdAt: String(apiPost.createdAt ?? new Date().toISOString()),
    updatedAt: String(apiPost.updatedAt ?? apiPost.createdAt ?? new Date().toISOString()),
    author,
    media: mappedMedia,
    likesCount: 0,
    favoritesCount: 0,
    replies: [],
  };
}

// ---------- Funciones API (integradas con backend disponible) ----------
async function fetchProfile(username: string): Promise<ProfileData> {
  let profileResponse: UserDto | PublicUserProfileResponse;

  if (username === "me") {
    const { data } = await axiosClient.get<UserDto>("/users/me/profile");
    profileResponse = data;
  } else {
    if (!isGuid(username)) {
      throw new Error(
        "El backend actual expone perfil público por userId (GUID), no por username."
      );
    }
    const { data } = await axiosClient.get<PublicUserProfileResponse>(`/users/${username}/profile`);
    profileResponse = data;
  }

  const author: Author = {
    id: profileResponse.id,
    name: profileResponse.displayName,
    handle: profileResponse.username,
    avatar: undefined,
    isVerified: true,
  };

  const apiPosts = (await postsApi.getUserPosts(profileResponse.id)) as unknown as BackendProfilePost[];
  const posts = apiPosts.map((apiPost) => mapApiPostToProfilePost(apiPost, author));

  return {
    user: author,
    bio: profileResponse.biography ?? "",
    languageCode: profileResponse.languageCode,
    timeZoneId: profileResponse.timeZoneId,
    // TODO(frontend-integration): backend aún no expone contadores de seguidores/seguidos.
    followingCount: 0,
    followersCount: 0,
    isFollowing: false,
    // TODO(frontend-integration): conectar suscripción cuando backend exponga endpoints.
    isSubscribed: false,
    posts,
  };
}

async function followUser(targetId: string) {
  await axiosClient.post(`/users/${targetId}/follow`);
}

async function unfollowUser(targetId: string) {
  await axiosClient.delete(`/users/${targetId}/unfollow`);
}

async function subscribeUser(username: string) {
  console.log('Subscribe', username);
}

async function unsubscribeUser(username: string) {
  console.log('Unsubscribe', username);
}

async function likePost(postId: string, userId: string) {
  await axiosClient.post(`/Posts/${postId}/like`, { postId, userId });
}

async function unlikePost(postId: string, userId: string) {
  await axiosClient.delete(`/Posts/${postId}/unlike`, { data: { postId, userId } });
}

async function repostPost(postId: string, userId: string) {
  await axiosClient.post(`/Posts/${postId}/repost`, {
    authorId: userId,
    originalPostId: postId,
  });
}

async function unRepostPost(postId: string) {
  // TODO(frontend-integration): backend no expone endpoint de "undo repost" por ahora.
  console.log('Unrepost pendiente endpoint backend', postId);
}

async function bookmarkPost(postId: string) {
  // TODO(frontend-integration): backend no expone endpoint de bookmarks por ahora.
  console.log('Bookmark pendiente endpoint backend', postId);
}

async function unbookmarkPost(postId: string) {
  // TODO(frontend-integration): backend no expone endpoint de bookmarks por ahora.
  console.log('Unbookmark pendiente endpoint backend', postId);
}

// ---------- Componentes reutilizables ----------
interface ActionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  count?: number;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, onClick, active, count, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors ${
      disabled ? "opacity-60 cursor-not-allowed" : ""
    }`}
  >
    <span className={active ? 'text-blue-600' : ''}>{icon}</span>
    {count !== undefined && <span className="text-xs">{count}</span>}
  </button>
);

interface FollowButtonProps {
  isFollowing: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const FollowButton: React.FC<FollowButtonProps> = ({ isFollowing, onClick, disabled = false }) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-1 rounded-full text-xs font-medium border transition-colors ${
        isFollowing
          ? 'bg-[#1351AA] text-white border-[#1B1C1E]'
          : 'bg-[#F3F3F1] text-[#1B1C1E] border-[#1B1C1E]'
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {isFollowing ? t("profile.follow_button.following") : t("profile.follow_button.follow")}
    </button>
  );
};

interface SubscribeButtonProps {
  isSubscribed: boolean;
  onClick?: () => void;
}

const SubscribeButton: React.FC<SubscribeButtonProps> = ({ isSubscribed, onClick }) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className={`px-5 py-1 rounded-full text-xs font-medium border transition-colors ${
        isSubscribed
          ? 'bg-[#1351AA] text-white border-[#1B1C1E]'
          : 'bg-[#F3F3F1] text-[#1B1C1E] border-[#1B1C1E]'
      }`}
    >
      <span className="text-[11px] font-medium leading-5 text-[#1B1C1E]"> 
        {isSubscribed ? t("profile.subscribe_button.subscribed") : t("profile.subscribe_button.subscribe")}
    </span>
    </button>
  );
};

interface CommissionButtonProps {
  onClick?: () => void;
}

const CommissionButton: React.FC<CommissionButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className="px-5 py-1 rounded-full text-xs font-medium bg-[#F3F3F1] text-[#1B1C1E] border border-[#1B1C1E]"
    >
      <span className="text-[11px] font-medium leading-5 text-[#1B1C1E]">
      {t("profile.commission_button")}
      </span>
    </button>
  );
};

interface ConfigurationButtonProps {
  onClick?: () => void;
}

const ConfigurationButton: React.FC<ConfigurationButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-5 py-1 rounded-full cursor-pointer transition hover:bg-[#E6E5E2] bg-[#F3F3F1] text-[#1B1C1E] border border-[#1B1C1E] flex items-center gap-1"
    >
      <Edit size={14} />
      <span className="text-[13px]  font-medium leading-5 text-[#1B1C1E]">
        {t("profile.configuration_button")}
      </span> 
    </button>
  );
};

interface FavoritesButtonProps {
  onClick?: () => void;
}

const FavoritesButton: React.FC<FavoritesButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-5 py-1 rounded-full cursor-pointer transition hover:bg-[#E6E5E2] bg-[#F3F3F1] text-[#1B1C1E] border border-[#1B1C1E] flex items-center gap-1"
    >
      <Bookmark size={14} />
      <span className="text-[13px] font-medium leading-5 text-[#1B1C1E]">
      {t("profile.saved_button")}
      </span>
    </button>
  );
};

interface MoreButtonProps {
  onClick?: () => void;
}

const MoreButton: React.FC<MoreButtonProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-7 h-7 rounded-full bg-[#F3F3F1] border border-[#1B1C1E] flex items-center justify-center cursor-pointer transition hover:bg-[#E6E5E2]"
  >
    <MoreHorizontal size={16} />
  </button>
);

interface WaveformPlayerProps {
  audioUrl: string;
  coverUrl?: string;
}

const WaveformPlayer: React.FC<WaveformPlayerProps> = ({ audioUrl, coverUrl }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    if (waveformRef.current && !wavesurfer.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#0B5107',
        progressColor: '#1351AA',
        cursorColor: 'transparent',
        barWidth: 2,
        barGap: 1,
        height: 40,
        responsive: true,
        url: audioUrl,
      });

      wavesurfer.current.on('play', () => setIsPlaying(true));
      wavesurfer.current.on('pause', () => setIsPlaying(false));
      wavesurfer.current.on('finish', () => setIsPlaying(false));
    }

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    wavesurfer.current?.playPause();
  };

  return (
    <div className="flex items-center gap-2 w-full">
      {coverUrl && (
        <img src={coverUrl} alt="cover" className="w-10 h-10 rounded object-cover" />
      )}
      <div ref={waveformRef} className="flex-1" />
      <button
        onClick={togglePlayPause}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          isPlaying ? 'bg-[#0B5107] text-white' : 'bg-[#E9FDE8] text-[#0B5107] border border-[#0B5107]'
        }`}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>
    </div>
  );
};



// ---------- PostCard ----------
interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.likesCount > 0);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [reposted, setReposted] = useState(false);
  const [repostsCount, setRepostsCount] = useState(post.favoritesCount);
  const [repostLoading, setRepostLoading] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyCount, setReplyCount] = useState(post.replies.length);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarksCount, setBookmarksCount] = useState(0);



  const requireAuth = () => {
    if (!user) {
      message.warning(t('profile.auth_required'));
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth()) return;
    if (!user?.id) return;
    const previous = liked;
    setLiked(!previous);
    setLikesCount(prev => (previous ? prev - 1 : prev + 1));
    try {
      if (previous) {
        await unlikePost(post.id, user.id);
      } else {
        await likePost(post.id, user.id);
      }
    } catch {
      setLiked(previous);
      setLikesCount(prev => (previous ? prev + 1 : prev - 1));
    }
  };

  const handleRepost = async () => {
    if (!requireAuth()) return;
    if (!user?.id) return;
    if (repostLoading) return;
    const previous = reposted;
    setReposted(!previous);
    setRepostsCount(prev => (previous ? prev - 1 : prev + 1));
    setRepostLoading(true);
    try {
      if (previous) {
        await unRepostPost(post.id);
      } else {
        await repostPost(post.id, user.id);
      }
      message.success(
        previous ? t("profile.repost_removed") : t("profile.repost_success")
      );
    } catch {
      setReposted(previous);
      setRepostsCount(prev => (previous ? prev + 1 : prev - 1));
      message.error(t("profile.repost_error"));
    } finally {
      setRepostLoading(false);
    }
  };

  const handleReply = async () => {
    if (!requireAuth()) return;
    if (!user?.id) return;

    const content = replyText.trim();
    if (!content) {
      message.warning(t("profile.reply_required"));
      return;
    }

    try {
      setReplyLoading(true);
      await axiosClient.post(`/Posts/${post.id}/reply`, {
        replyToPostId: post.id,
        authorId: user.id,
        title: post.title ?? t("profile.reply_default_title"),
        content,
      });
      setReplyCount((prev) => prev + 1);
      setReplyText("");
      setReplyOpen(false);
      message.success(t("profile.reply_success"));
    } catch {
      message.error(t("profile.reply_error"));
    } finally {
      setReplyLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!requireAuth()) return;
    const previous = bookmarked;
    setBookmarked(!previous);
    setBookmarksCount(prev => (previous ? prev - 1 : prev + 1));
    try {
      if (previous) {
        await unbookmarkPost(post.id);
      } else {
        await bookmarkPost(post.id);
      }
    } catch {
      setBookmarked(previous);
      setBookmarksCount(prev => (previous ? prev + 1 : prev - 1));
    }
  };



  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const imageMedia = post.media.find(m => m.media.mimeType.startsWith('image'));
  const audioMedia = post.media.find(m => m.media.mimeType.startsWith('audio'));

  return (
    <div className="w-full">
      <div className="flex gap-3">
        <Avatar
          src={post.author.avatar}
          icon={!post.author.avatar && <User size={24} />}
          size={45}
          className="bg-white border border-gray-800 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{post.author.name}</span>
            {post.author.isVerified && (
              <Check size={14} className="text-[#0B5107]" />
            )}
            <span className="text-gray-500">·</span>
            <button
              type="button"
              onClick={() => {
                if (post.author.id) {
                  navigate(`/profile?userId=${post.author.id}`);
                }
              }}
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              @{post.author.handle}
            </button>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">{formatDate(post.createdAt)}</span>
            <MoreButton onClick={() => {}} />
          </div>

          <p className="text-gray-800 mt-1 text-sm text-justify">{post.content}</p>



          {post.type === PostType.IMAGE && post.media.length > 0 && (
            <div className="mt-3">
              {post.media.length === 1 ? (
                <img
                  src={post.media[0].media.path}
                  alt="post"
                  className="w-full rounded-lg"
                  style={{ maxHeight: 400, objectFit: 'cover' }}
                />
              ) : (
                <div className="flex gap-2">
                  <img
                    src={post.media[0].media.path}
                    alt="post"
                    className="flex-1 object-cover rounded-lg"
                    style={{ height: 200 }}
                  />
                  <div className="flex flex-col gap-2 flex-1">
                    {post.media.slice(1).map((m, idx) => (
                      <img
                        key={idx}
                        src={m.media.path}
                        alt="post"
                        className="w-full object-cover rounded-lg"
                        style={{ height: 95 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            


          )}

          {post.type === PostType.AUDIO && audioMedia && (
            <div className="mt-3">
              <WaveformPlayer
                audioUrl={audioMedia.media.path}
                coverUrl={imageMedia?.media.path}
              />
            </div>
          )}

          {post.type === PostType.LINK && (
            <div className="mt-3">
              <a
                href={post.media[0]?.media.path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {post.media[0]?.media.path}
              </a>
            </div>
          )}

          <div className="flex items-center gap-6 mt-3 text-gray-600">
            <ActionButton
              icon={<Heart size={18} fill={liked ? 'currentColor' : 'none'} />}
              onClick={handleLike}
              active={liked}
              count={likesCount}
            />
            <ActionButton
              icon={<MessageCircle size={18} />}
              count={replyCount}
              onClick={() => setReplyOpen((prev) => !prev)}
            />
            <ActionButton
              icon={<Repeat2 size={18} fill={reposted ? 'currentColor' : 'none'} />}
              onClick={handleRepost}
              active={reposted}
              count={repostsCount}
              disabled={repostLoading}
            />
            <ActionButton
              icon={<Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />}
              onClick={handleBookmark}
              active={bookmarked}
              count={bookmarksCount}
            />
          </div>
          {replyOpen ? (
            <div className="mt-3 flex items-center gap-2">
              <Input
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                placeholder={t("profile.reply_placeholder")}
                maxLength={500}
              />
              <button
                type="button"
                onClick={() => void handleReply()}
                disabled={replyLoading}
                className={`px-3 h-8 rounded-full border border-[#1B1C1E] text-[12px] ${
                  replyLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                {replyLoading ? t("profile.reply_sending") : t("profile.reply_send")}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// ---------- Componente principal Profile ----------
const Profile: React.FC = () => {
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  // const { username } = useParams<{ username: string }>();
  const { username: usernameParam } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [portfolioSettings, setPortfolioSettings] = useState <{
  imagesEnabled: boolean;
 musicEnabled: boolean;
  literatureEnabled: boolean;
  } | null>(null);

const [activeMainTab, setActiveMainTab] = useState('portfolio');
const [activePortfolioSubTab, setActivePortfolioSubTab] = useState("images");
const [activeMusicTab, setActiveMusicTab] = useState<"songs" | "albums">("songs");
const [isFollowing, setIsFollowing] = useState(false);
const [followLoading, setFollowLoading] = useState(false);
const [isSubscribed, setIsSubscribed] = useState(false);
const [modalVisible, setModalVisible] = useState(false);
const [portfolioModalType, setPortfolioModalType] = useState<UploadMediaType>(PostType.IMAGE);

const handleGoToSettings = () => {
  navigate("/settings");
};

const handleMoreMenuClick = () => {
  message.info(t("profile.more_menu_pending"));
};

const handleGoToSaved = () => {
 message.info(t("profile.saved_pending"));
};
// Determinar si es el perfil propio (ruta /profile/me)
// const isOwnProfile = username === 'me';

const username = usernameParam ?? "me";
const queryUserId = searchParams.get("userId");
const profileIdentifier = queryUserId ?? username;
const isOwnProfile = profileIdentifier === "me";
  useEffect(() => {
    const loadProfile = async () => {
      if (!profileIdentifier) {
        setError('No username provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let profileData: ProfileData;
        
        if (isOwnProfile) {
          if (!user) {
            // Si no hay usuario autenticado, redirigir al login
            navigate('/login');
            return;
          }
          // Aquí llamarías a una API que devuelva el perfil del usuario autenticado
          profileData = await fetchProfile('me');
        } else {
          // Perfil de otro usuario
          profileData = await fetchProfile(profileIdentifier);
        }

        setProfile(profileData);
        setIsFollowing(profileData.isFollowing || false);
        setIsSubscribed(profileData.isSubscribed || false);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profileIdentifier, user, navigate, isOwnProfile]);

    useEffect(() => {
    const loadPortfolioSettings = async () => {
      const settings = await settingsRepository.getSettings();
      setPortfolioSettings(settings.portfolio);
    };

  void loadPortfolioSettings();
}, []);

  const handleFollow = async () => {
    if (!user) {
      message.warning(t('profile.auth_required'));
      navigate('/login');
      return;
    }
    if (!profile?.user.id) return;
    if (followLoading) return;
    const previous = isFollowing;
    setIsFollowing(!previous);
    setFollowLoading(true);
    try {
      if (previous) {
        await unfollowUser(profile.user.id);
      } else {
        await followUser(profile.user.id);
      }
    } catch {
      setIsFollowing(previous);
      message.error(t("profile.follow_update_error"));
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      message.warning(t('profile.auth_required'));
      navigate('/login');
      return;
    }
    const previous = isSubscribed;
    setIsSubscribed(!previous);
    try {
      if (previous) {
        await unsubscribeUser(username!);
      } else {
        await subscribeUser(username!);
      }
    } catch {
      setIsSubscribed(previous);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#E3E2DE] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full min-h-screen bg-[#E3E2DE] flex items-center justify-center">
        <Text type="danger">{error || t("profile.not_found")}</Text>
      </div>
    );
  }

  const mainTabItems  = [
    { key: 'portfolio', label: t('profile.tabs.portfolio') },
    { key: 'publications', label: t('profile.tabs.publications') },
    { key: 'members', label: t('profile.tabs.members') },
  ];

const portfolioSubTabs = [
  { key: "images", label: t("profile.portfolio.images") },
  { key: "music", label: t("profile.portfolio.music") },
  { key: "literature", label: t("profile.portfolio.literature") },
];

const effectivePortfolioTab =
  portfolioSubTabs.find((tab) => tab.key === activePortfolioSubTab)?.key ??
  portfolioSubTabs[0]?.key ??
  "";

const getFilteredPosts = () => {
  let posts = profile.posts;

  if (activeMainTab === "publications") {
    posts = posts.filter((p) => p.isWork === false);
  } else if (activeMainTab === "members") {
    posts = [];
  } else if (activeMainTab === "portfolio") {
    posts = [];
  }

  return posts;
};
  const filteredPosts = getFilteredPosts();
  const isPortfolioView = activeMainTab === "portfolio";
  const getActivePortfolioFormRoute = () => {
    if (activeMainTab !== "portfolio") return null;

    if (activePortfolioSubTab === "images") {
      return `/profile/${username}/portfolio/update/artist`;
    }

    if (activePortfolioSubTab === "literature") {
      return `/profile/${username}/portfolio/update/writer`;
    }

    if (activePortfolioSubTab === "music") {
      return activeMusicTab === "albums"
        ? `/profile/${username}/portfolio/update/music/albums`
        : `/profile/${username}/portfolio/update/music/songs`;
    }

    return null;
  };

const handleUpdatePortfolioClick = () => {
  if (activePortfolioSubTab === "images") {
    setPortfolioModalType("image");
  } else if (activePortfolioSubTab === "literature") {
    setPortfolioModalType("text");
  } else if (activePortfolioSubTab === "music") {
    setPortfolioModalType("music");
  }

  setModalVisible(true);
};

const shouldShowUpdatePortfolioButton = activeMainTab === "portfolio";
  
 return (
  <div className="w-full max-w-[870px] h-full min-h-screen">
    <div
    className={`w-full h-full ${
      isPortfolioView
        ? "bg-transparent border-none"
        : "bg-[#E8F1FC] border-l-2 border-r-2 border-[#8F8E8A]"
    }`}
  >
      <div className=" pt-6 ">
        {/* Perfil header */}
        <div className="flex flex-col md:flex-row gap-6 px-[70px]" >
          

          
          <div className="flex justify-center md:justify-start">
            <Avatar
              src={profile.user.avatar}
              icon={!profile.user.avatar && <User size={60} />}
              size={141}
              className="bg-white border-2 border-gray-800"
            />
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Title level={3} className="!mb-0">
                    {profile.user.name}
                  </Title>
                  {profile.user.isVerified && (
                    <div className="w-5 h-5 bg-[#0B5107] rounded-full flex items-center justify-center border border-gray-800">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <Text type="secondary">@{profile.user.handle}</Text>
              </div>

            <div className="flex flex-wrap gap-2">
              {isOwnProfile ? (
                <>
                  <ConfigurationButton onClick={handleGoToSettings} />
                  <FavoritesButton onClick={handleGoToSaved} />
                  <MoreButton onClick={handleMoreMenuClick} />
                </>
              ) : (
                <>
                  <CommissionButton />
                  <SubscribeButton
                    isSubscribed={isSubscribed}
                    onClick={handleSubscribe}
                  />
                  <FollowButton
                    isFollowing={isFollowing}
                    onClick={handleFollow}
                    disabled={followLoading}
                  />
                  <MoreButton />
                </>
              )}
            </div>
            </div>

            <p className="text-gray-800 text-sm text-justify mt-4 leading-relaxed">
              {profile.bio}
            </p>

            <div className="flex gap-6 mt-4 text-sm">
              <span>{profile.followingCount} {t("profile.following")}</span>
              <span>{profile.followersCount} {t("profile.followers")}</span>
            </div>
          </div>
        </div>

        <div className=" krea-tabs">
          <Tabs
            activeKey={activeMainTab}
            onChange={setActiveMainTab}
            items={mainTabItems}
            centered={!isMobile}
            tabBarStyle={{ borderBottom: "none" }}
            tabBarGutter={46}
          />
        </div>

{activeMainTab === "portfolio" && (
  <>
    <div className="krea-tabs">
      <Tabs
        activeKey={effectivePortfolioTab}
        onChange={setActivePortfolioSubTab}
        items={portfolioSubTabs}
        centered={!isMobile}
        tabBarStyle={{ borderBottom: "none" }}
        tabBarGutter={46}
        size="small"
      />
    </div>

    {shouldShowUpdatePortfolioButton && (
      <div className="px-[70px] mt-[-6px] mb-[10px] flex justify-end">
       <div className="ml-[500px] -mt-[30px] relative z-20"> 
          <button
            type="button"
            onClick={handleUpdatePortfolioClick}
            className="rounded-full bg-[#0B5107] cursor-pointer transition hover:bg-[#093B05] px-[14px] py-[6px] text-[11px] border border-[#1B1C1E]"
          >
            <span className="text-[13px] font-medium leading-5 text-[#E3E2DE]">
                  {t("profile.update_portfolio_button")}
            </span>
           </button>
        </div>
      </div>
              )}
              </>
          )}
    </div>
        
         {/*LINEA DEL DIABLO*/}
        {!isPortfolioView && (
          <div className="w-[868px] h-px bg-[#8F8E8A] my-4 self-center" />
        )}

        <div className={` ${
            isPortfolioView
              ? "pt-[20px]"
              : ""
          }`}
        >

          {activeMainTab === "portfolio" && effectivePortfolioTab === "images" && (
           <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <DigitalPortfolio items={digitalPortfolioMock} />
           </div>
          )}

          {activeMainTab === "portfolio" && effectivePortfolioTab === "music" && (
            <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pb-[25px]">
              <MusicPortfolio />
            </div>
          )}
          
          {activeMainTab === "portfolio" && effectivePortfolioTab === "literature" && (
            <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pb-[25px]">
              <WriterPortfolio />
            </div>
          )}

            {activeMainTab !== "portfolio" && (
              <div className="space-y-8 px-[70px]">
                {filteredPosts.map((post) => (
                  <div key={post.id}>
                    <PostCard post={post} />
                    <div className="w-[868px] h-px bg-[#8F8E8A] my-4 -ml-[70px]" />
                  </div>
                ))}
                {filteredPosts.length === 0 && (
                  <div className="text-center text-gray-500 py-8 ">
                    {t("profile.no_posts")}
                  </div>
                )}
              </div>
            )}
            </div>
                  <CreatePortfolioPostModal
        visible={modalVisible}
        initialPostType={portfolioModalType}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
        }}
      />
        </div>
  </div>
);
};

export default Profile;