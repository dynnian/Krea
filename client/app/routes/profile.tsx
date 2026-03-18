// profile.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, Tabs, Typography, Grid, message, Spin } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import DigitalPortfolio from "../components/Profile/DigitalPortfolio";
import MusicPortfolio from "../components/Profile/MusicPortfolio";
import { digitalPortfolioMock } from "../data/digitalPortfolioMock";
import WriterPortfolio from "../components/Profile/WriterPortfolio";
import { settingsRepository } from "../services/settingsRepository";
import CreatePortfolioPostModal from "../components/Posts/CreatePortfolioPostModal";
import axiosClient from "../lib/axios";


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
}

interface Author {
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
  postId: number;
  mediaId: string;
  isWorkMedia: boolean;
  media: Media;
}

interface Post {
  id: number;
  userPostId: number;
  type: PostType;
  title: string | null;
  content: string;
  isWork: boolean;
  isDeleted: boolean;
  isLocal: boolean;
  postRepliedTo: number | null;
  postRepostOf: number | null;
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
  followingCount: number;
  followersCount: number;
  isFollowing?: boolean;
  isSubscribed?: boolean;
  posts: Post[];
}

// ---------- Funciones API (debes implementar) ----------
async function fetchProfile(username: string): Promise<ProfileData> {
  // Simular llamada API
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockProfile: ProfileData = {
        user: {
          name: username === 'me' ? 'Mi Usuario' : 'Usuario',
          handle: username === 'me' ? 'mi_usuario' : username,
          avatar: undefined,
          isVerified: true,
        },
        bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididu.',
        followingCount: 10,
        followersCount: 10,
        isFollowing: false,
        isSubscribed: false,
        posts: [
          // Post con múltiples imágenes (isWork = true)
          {
            id: 1,
            userPostId: 1,
            type: PostType.IMAGE,
            title: null,
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis',
            isWork: true,
            isDeleted: false,
            isLocal: false,
            postRepliedTo: null,
            postRepostOf: null,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            author: {
              name: username === 'me' ? 'Mi Usuario' : 'Usuario',
              handle: username === 'me' ? 'mi_usuario' : username,
              avatar: undefined,
            },
            media: [
              {
                postId: 1,
                mediaId: '101',
                isWorkMedia: true,
                media: {
                  id: '101',
                  originalFileName: 'imagen1.jpg',
                  fileName: 'imagen1.jpg',
                  mimeType: 'image/jpeg',
                  path: 'https://placehold.co/294x431',
                  uploadedAt: new Date().toISOString(),
                },
              },
              {
                postId: 1,
                mediaId: '102',
                isWorkMedia: true,
                media: {
                  id: '102',
                  originalFileName: 'imagen2.jpg',
                  fileName: 'imagen2.jpg',
                  mimeType: 'image/jpeg',
                  path: 'https://placehold.co/294x211',
                  uploadedAt: new Date().toISOString(),
                },
              },
              {
                postId: 1,
                mediaId: '103',
                isWorkMedia: true,
                media: {
                  id: '103',
                  originalFileName: 'imagen3.jpg',
                  fileName: 'imagen3.jpg',
                  mimeType: 'image/jpeg',
                  path: 'https://placehold.co/294x211',
                  uploadedAt: new Date().toISOString(),
                },
              },
            ],
            likesCount: 5,
            favoritesCount: 2,
            replies: [],
          },
          // Post con imagen grande (isWork = false)
          {
            id: 2,
            userPostId: 2,
            type: PostType.IMAGE,
            title: null,
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis',
            isWork: false,
            isDeleted: false,
            isLocal: false,
            postRepliedTo: null,
            postRepostOf: null,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            author: {
              name: username === 'me' ? 'Mi Usuario' : 'Usuario',
              handle: username === 'me' ? 'mi_usuario' : username,
              avatar: undefined,
            },
            media: [
              {
                postId: 2,
                mediaId: '201',
                isWorkMedia: false,
                media: {
                  id: '201',
                  originalFileName: 'imagen.jpg',
                  fileName: 'imagen.jpg',
                  mimeType: 'image/jpeg',
                  path: 'https://placehold.co/596x321',
                  uploadedAt: new Date().toISOString(),
                },
              },
            ],
            likesCount: 3,
            favoritesCount: 1,
            replies: [],
          },
          // Post con audio (isWork = true)
          {
            id: 3,
            userPostId: 3,
            type: PostType.AUDIO,
            title: 'Mi canción',
            content: 'Escucha mi nuevo tema',
            isWork: true,
            isDeleted: false,
            isLocal: false,
            postRepliedTo: null,
            postRepostOf: null,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            author: {
              name: username === 'me' ? 'Mi Usuario' : 'Usuario',
              handle: username === 'me' ? 'mi_usuario' : username,
              avatar: undefined,
            },
            media: [
              {
                postId: 3,
                mediaId: '301',
                isWorkMedia: true,
                media: {
                  id: '301',
                  originalFileName: 'audio.mp3',
                  fileName: 'audio.mp3',
                  mimeType: 'audio/mpeg',
                  path: '/assets/audio-sample.mp3',
                  uploadedAt: new Date().toISOString(),
                },
              },
              {
                postId: 3,
                mediaId: '302',
                isWorkMedia: true,
                media: {
                  id: '302',
                  originalFileName: 'cover.jpg',
                  fileName: 'cover.jpg',
                  mimeType: 'image/jpeg',
                  path: 'https://placehold.co/596x321',
                  uploadedAt: new Date().toISOString(),
                },
              },
            ],
            likesCount: 5,
            favoritesCount: 2,
            replies: [],
          },
        ],
      };
      resolve(mockProfile);
    }, 500);
  });
}

async function fetchMyProfileFromApi() {
  const res = await axiosClient.get("/users/me/profile");
  return res.data;
}

async function followUser(username: string) {
  // Implementar llamada real
  console.log('Follow', username);
}

async function unfollowUser(username: string) {
  console.log('Unfollow', username);
}

async function subscribeUser(username: string) {
  console.log('Subscribe', username);
}

async function unsubscribeUser(username: string) {
  console.log('Unsubscribe', username);
}

async function likePost(postId: number) {
  console.log('Like', postId);
}

async function unlikePost(postId: number) {
  console.log('Unlike', postId);
}

async function repostPost(postId: number) {
  console.log('Repost', postId);
}

async function unRepostPost(postId: number) {
  console.log('Unrepost', postId);
}

async function bookmarkPost(postId: number) {
  console.log('Bookmark', postId);
}

async function unbookmarkPost(postId: number) {
  console.log('Unbookmark', postId);
}

// ---------- Componentes reutilizables ----------
interface ActionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  count?: number;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, onClick, active, count }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors"
  >
    <span className={active ? 'text-blue-600' : ''}>{icon}</span>
    {count !== undefined && <span className="text-xs">{count}</span>}
  </button>
);

interface FollowButtonProps {
  isFollowing: boolean;
  onClick?: () => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ isFollowing, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-1 rounded-full text-xs font-medium border transition-colors ${
      isFollowing
        ? 'bg-[#1351AA] text-white border-[#1B1C1E]'
        : 'bg-[#F3F3F1] text-[#1B1C1E] border-[#1B1C1E]'
    }`}
  >
    {isFollowing ? 'Siguiendo' : 'Seguir'}
  </button>
);

interface SubscribeButtonProps {
  isSubscribed: boolean;
  onClick?: () => void;
}

const SubscribeButton: React.FC<SubscribeButtonProps> = ({ isSubscribed, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-1 rounded-full text-xs font-medium border transition-colors ${
      isSubscribed
        ? 'bg-[#1351AA] text-white border-[#1B1C1E]'
        : 'bg-[#F3F3F1] text-[#1B1C1E] border-[#1B1C1E]'
    }`}
  >
    <span className="text-[11px] font-medium leading-5 text-[#1B1C1E]"> 
      {isSubscribed ? 'Subscrito' : 'Subscribirse'}
  </span>
  </button>
);

interface CommissionButtonProps {
  onClick?: () => void;
}

const CommissionButton: React.FC<CommissionButtonProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-5 py-1 rounded-full text-xs font-medium bg-[#F3F3F1] text-[#1B1C1E] border border-[#1B1C1E]"
  >
    <span className="text-[11px] font-medium leading-5 text-[#1B1C1E]">
    Comisión
    </span>
  </button>
);

interface ConfigurationButtonProps {
  onClick?: () => void;
}

const ConfigurationButton: React.FC<ConfigurationButtonProps> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="px-5 py-1 rounded-full cursor-pointer transition hover:bg-[#E6E5E2] bg-[#F3F3F1] text-[#1B1C1E] border border-[#1B1C1E] flex items-center gap-1"
  >
    <Edit size={14} />
    <span className="text-[13px]  font-medium leading-5 text-[#1B1C1E]">
       Configuración
    </span> 
  </button>
);

interface FavoritesButtonProps {
  onClick?: () => void;
}

const FavoritesButton: React.FC<FavoritesButtonProps> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="px-5 py-1 rounded-full cursor-pointer transition hover:bg-[#E6E5E2] bg-[#F3F3F1] text-[#1B1C1E] border border-[#1B1C1E] flex items-center gap-1"
  >
    <Bookmark size={14} />
    <span className="text-[13px] font-medium leading-5 text-[#1B1C1E]">
     Guardados
    </span>
  </button>
);

interface MoreButtonProps {
  onClick?: () => void;
}

const MoreButton: React.FC<MoreButtonProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-7 h-7 rounded-full bg-[#F3F3F1] border border-[#1B1C1E] flex items-center justify-center"
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
    const previous = liked;
    setLiked(!previous);
    setLikesCount(prev => (previous ? prev - 1 : prev + 1));
    try {
      if (previous) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
    } catch {
      setLiked(previous);
      setLikesCount(prev => (previous ? prev + 1 : prev - 1));
    }
  };

  const handleRepost = async () => {
    if (!requireAuth()) return;
    const previous = reposted;
    setReposted(!previous);
    setRepostsCount(prev => (previous ? prev - 1 : prev + 1));
    try {
      if (previous) {
        await unRepostPost(post.id);
      } else {
        await repostPost(post.id);
      }
    } catch {
      setReposted(previous);
      setRepostsCount(prev => (previous ? prev + 1 : prev - 1));
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
            <span className="text-gray-500">@{post.author.handle}</span>
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
              count={post.replies.length}
            />
            <ActionButton
              icon={<Repeat2 size={18} fill={reposted ? 'currentColor' : 'none'} />}
              onClick={handleRepost}
              active={reposted}
              count={repostsCount}
            />
            <ActionButton
              icon={<Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />}
              onClick={handleBookmark}
              active={bookmarked}
              count={bookmarksCount}
            />
          </div>
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
const [isSubscribed, setIsSubscribed] = useState(false);
const [modalVisible, setModalVisible] = useState(false);
const [portfolioModalType, setPortfolioModalType] = useState<UploadMediaType>(PostType.IMAGE);

const handleGoToSettings = () => {
  navigate("/settings");
};

const handleGoToSaved = () => {
 navigate("/saved");
};
// Determinar si es el perfil propio (ruta /profile/me)
// const isOwnProfile = username === 'me';

const username = usernameParam ?? "me";
const isOwnProfile = username === "me";
  useEffect(() => {
    const loadProfile = async () => {
      if (!username) {
        setError('No username provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let profileData: ProfileData;
        
 if (isOwnProfile) {
  if (!user) {
    navigate('/login');
    return;
  }

  const mockProfile = await fetchProfile('me');
  const apiProfile = await fetchMyProfileFromApi();
  console.log("apiProfile", apiProfile);

  profileData = {
    ...mockProfile,
    user: {
      ...mockProfile.user,
      name: apiProfile.displayName || apiProfile.username,
      handle: apiProfile.username,
    },
    bio: apiProfile.biography ?? "",
  };
  } else {
    profileData = await fetchProfile(username);
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
  }, [username, user, navigate, isOwnProfile]);

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
    const previous = isFollowing;
    setIsFollowing(!previous);
    try {
      if (previous) {
        await unfollowUser(username!);
      } else {
        await followUser(username!);
      }
    } catch {
      setIsFollowing(previous);
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
        <Text type="danger">{error || 'Perfil no encontrado'}</Text>
      </div>
    );
  }

  const mainTabItems  = [
    { key: 'portfolio', label: t('Portafolio') },
    { key: 'publications', label: t('Publicatciones') },
    { key: 'members', label: t('Miembros') },
  ];

const portfolioSubTabs = [
  { key: "images", label: "Imágenes" },
  { key: "music", label: "Música" },
  { key: "literature", label: "Literatura" },
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
                  <MoreButton />
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
              <span>{profile.followingCount} Seguidos</span>
              <span>{profile.followersCount} Seguidores</span>
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
                  Actualizar Portafolio
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