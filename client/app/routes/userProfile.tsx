// deno-lint-ignore-file
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Spin,
  Alert,
  Avatar,
  Button,
  message,
  Tabs,
  Modal,
  List,
  Pagination,
  Input,
  Dropdown,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { ChevronDown } from "lucide-react";
import type { MenuProps } from "antd";
import { useAuth } from "../contexts/AuthContext.tsx";
import { userService, type PublicUserProfile, type FollowUserResponse } from "../services/userService.ts";
import { directMessagesApi } from "../services/directMessagesService.ts";
import { postsApi } from "../services/postsService.ts";
import { collectionsApi } from "../services/collectionsService.ts";
import DigitalPortfolio from "../components/Profile/DigitalPortfolio.tsx";
import MusicPortfolio from "../components/Profile/MusicPortfolio.tsx";
import WriterPortfolio from "../components/Profile/WriterPortfolio.tsx";
import PostCard from "../components/Posts/PostCard.tsx";
import {
  normalizeApiPosts,
  mapPostsToMusicSongs,
  mapPostsToVisualPortfolioItems,
  mapPostsToWriterWorks,
} from "../utils/profileMapper.ts";
import type { MusicSong, MusicAlbum } from "../components/Profile/MusicPortfolio.tsx";
import type {
  WriterWork,
  WriterCollectionPreview,
} from "../components/Profile/WriterPortfolio.tsx";
import ProfileHeader from "../components/Profile/ProfileHeader.tsx";
import type { ProfileData } from "../types/profile.ts";

const { TextArea } = Input;

// --- Modal de lista de usuarios (followers / following) ---
const FollowListModal: React.FC<{
  open: boolean;
  title: string;
  userId: string;
  type: "followers" | "following";
  onClose: () => void;
}> = ({ open, title, userId, type, onClose }) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<FollowUserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const fetchList = async (currentPage: number) => {
    setLoading(true);
    try {
      const res =
        type === "followers"
          ? await userService.getFollowers(userId, currentPage, pageSize)
          : await userService.getFollowing(userId, currentPage, pageSize);
      setUsers(res.data.users);
      setTotal(res.data.totalCount);
    } catch (error) {
      console.error(error);
      message.error(t("profile.follow_list_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setPage(1);
      fetchList(1);
    }
  }, [open, userId, type]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchList(newPage);
  };

  const handleFollowToggle = async (targetUserId: string, isCurrentlyFollowing: boolean) => {
    try {
      if (isCurrentlyFollowing) {
        await userService.unfollow(targetUserId);
      } else {
        await userService.follow(targetUserId);
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUserId ? { ...u, isFollowing: !isCurrentlyFollowing } : u
        )
      );
      message.success(isCurrentlyFollowing ? t("profile.unfollowed") : t("profile.followed"));
    } catch {
      message.error(t("profile.follow_error"));
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      bodyStyle={{ padding: "16px" }}
    >
      <List
        loading={loading}
        dataSource={users}
        renderItem={(user) => (
          <List.Item
            actions={[
              <Button
                key="follow"
                size="small"
                type={user.isFollowing ? "default" : "primary"}
                onClick={() => handleFollowToggle(user.id, user.isFollowing)}
              >
                {user.isFollowing ? t("profile.unfollow") : t("profile.follow")}
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  src={user.profilePictureUrl}
                  icon={<UserOutlined />}
                  size={40}
                />
              }
              title={
                <div>
                  <span className="font-medium">{user.displayName}</span>
                  <span className="text-gray-500 text-sm ml-2">@{user.username}</span>
                </div>
              }
              description={user.biography}
            />
          </List.Item>
        )}
      />
      {total > pageSize && (
        <div className="flex justify-center mt-4">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={handlePageChange}
            size="small"
          />
        </div>
      )}
    </Modal>
  );
};

// --- Modal para enviar mensaje directo ---
const DirectMessageModal: React.FC<{
  open: boolean;
  receiverId: string;
  receiverName: string;
  onClose: () => void;
}> = ({ open, receiverId, receiverName, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) {
      message.warning(t("profile.dm_empty"));
      return;
    }
    if (!user) return;
    setLoading(true);
    try {
      await directMessagesApi.sendMessage({
        senderId: user.id,
        receiverId,
        content: content.trim(),
      });
      message.success(t("profile.dm_sent"));
      setContent("");
      onClose();
    } catch (error) {
      console.error(error);
      message.error(t("profile.dm_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`${t("profile.send_message_to")} ${receiverName}`}
      open={open}
      onCancel={onClose}
      onOk={handleSend}
      okText={t("common.send")}
      cancelText={t("common.cancel")}
      confirmLoading={loading}
    >
      <TextArea
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("profile.dm_placeholder")}
      />
    </Modal>
  );
};

// --- Componente principal ---
export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Portfolio data
  const [activeMainTab, setActiveMainTab] = useState("portfolio");
  const [activePortfolioSubTab, setActivePortfolioSubTab] = useState("images");
  const [visualItems, setVisualItems] = useState<any[]>([]);
  const [musicSongs, setMusicSongs] = useState<MusicSong[]>([]);
  const [musicAlbums, setMusicAlbums] = useState<MusicAlbum[]>([]);
  const [writerWorks, setWriterWorks] = useState<WriterWork[]>([]);
  const [writerCollections, setWriterCollections] = useState<WriterCollectionPreview[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [dmModalOpen, setDmModalOpen] = useState(false);

  // Redirigir si es el propio perfil
  useEffect(() => {
    if (currentUser && userId === currentUser.id) {
      navigate("/profile", { replace: true });
    }
  }, [currentUser, userId, navigate]);

  // Cargar perfil público
  useEffect(() => {
    if (!userId || (currentUser && userId === currentUser.id)) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await userService.getPublicProfile(userId);
        const publicProfile = res.data as any;

        setProfile(res.data);
        setIsFollowing(
          publicProfile.isFollowing ??
            publicProfile.IsFollowing ??
            publicProfile.isFollowedByCurrentUser ??
            publicProfile.IsFollowedByCurrentUser ??
            false
        );
      } catch (err) {
        console.error(err);
        setError(t("profile.load_error"));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, currentUser, t]);

  // Cargar posts, colecciones, etc.
  useEffect(() => {
    if (!userId || (currentUser && userId === currentUser.id)) return;

    const fetchUserContent = async () => {
      setPostsLoading(true);
      try {
        const postsRes = await postsApi.getUserPosts(userId, 1, 100);
        const rawPosts = Array.isArray(postsRes.data) ? postsRes.data : [];
        const normalized = normalizeApiPosts(rawPosts, profile?.displayName || "");

        const resolvedVisualItems = mapPostsToVisualPortfolioItems(normalized);
        const resolvedMusicSongs = mapPostsToMusicSongs(normalized);
        const resolvedWriterWorks = mapPostsToWriterWorks(normalized);

        setPosts(normalized);
        setVisualItems(resolvedVisualItems);
        setMusicSongs(resolvedMusicSongs);
        setWriterWorks(resolvedWriterWorks);

        const collections = await collectionsApi.getUserCollections(userId);

        const getCollectionType = (collection: any) =>
          collection.type ??
          collection.collectionType ??
          collection.CollectionType;

        const musicCollections = collections.filter(
          (collection: any) => getCollectionType(collection) === 1
        );

        const literatureCollections = collections.filter(
          (collection: any) => getCollectionType(collection) === 2
        );

        setMusicAlbums(
          musicCollections.map((collection: any) => ({
            id: collection.id,
            title: collection.title,
            releaseDate: collection.updatedAt,
            songsCount: collection.itemCount,
            coverUrl:
              collection.coverUrl ??
              collection.coverImageUrl ??
              "https://placehold.co/240x240?text=Album",
            tracks: [],
          }))
        );

        const literatureCollectionsWithPreview = await Promise.all(
          literatureCollections.map(async (collection: any) => {
            try {
              const detail = await collectionsApi.getCollectionById(collection.id);

              const collectionWorks = detail.posts
                .map((post: any) => {
                  const matchingWork = resolvedWriterWorks.find(
                    (work) => work.postId === post.id
                  );

                  if (!matchingWork) return null;

                  return matchingWork;
                })
                .filter((work: any): work is WriterWork => work !== null);

              const latestThreeBooks = collectionWorks.slice(0, 3);

              return {
                id: collection.id,
                title: collection.title,
                workIds: collectionWorks.map((work) => work.id),
                coverUrl:
                  collection.coverUrl ??
                  collection.coverImageUrl ??
                  collectionWorks[0]?.coverUrl ??
                  "",
                previewCovers: latestThreeBooks.map((work) => work.coverUrl),
              };
            } catch (collectionError) {
              console.error(
                "Error loading public literature collection preview:",
                collection.id,
                collectionError
              );
              return null;
            }
          })
        );

        setWriterCollections(
          literatureCollectionsWithPreview.filter(
            (collection): collection is WriterCollectionPreview => collection !== null
          )
        );
      } catch (err) {
        console.error(err);
        setPostsError(t("profile.posts_error"));
      } finally {
        setPostsLoading(false);
      }
    };
    fetchUserContent();
  }, [userId, currentUser, profile?.displayName, t]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      message.warning(t("profile.login_to_follow"));
      navigate("/login");
      return;
    }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await userService.unfollow(userId!);
        setIsFollowing(false);
        setProfile((prev) =>
          prev ? { ...prev, followersCount: Math.max(0, prev.followersCount - 1) } : prev
        );
        message.success(t("profile.unfollowed"));
      } else {
        await userService.follow(userId!);
        setIsFollowing(true);
        setProfile((prev) =>
          prev ? { ...prev, followersCount: prev.followersCount + 1 } : prev
        );
        message.success(t("profile.followed"));
      }
    } catch {
      message.error(t("profile.follow_error"));
    } finally {
      setFollowLoading(false);
    }
  };
  const handleDonation = () => {
    navigate(`/donations/${userId}`);
  };

  // --- Configuración del dropdown de portafolio ---
  const portfolioOptions = [
    ...(visualItems.length > 0 ? [{ key: "images", label: t("portfolio.images") }] : []),
    ...(musicSongs.length > 0 || musicAlbums.length > 0 ? [{ key: "music", label: t("portfolio.music") }] : []),
    ...(writerWorks.length > 0 ? [{ key: "literature", label: t("portfolio.literature") }] : []),
  ];

  const hasPortfolio = portfolioOptions.length > 0;

  // Asegurar que la subpestaña activa sea válida
  useEffect(() => {
    if (portfolioOptions.length > 0 && !portfolioOptions.some(opt => opt.key === activePortfolioSubTab)) {
      setActivePortfolioSubTab(portfolioOptions[0].key);
    }
  }, [portfolioOptions, activePortfolioSubTab]);

  const portfolioDropdownItems: MenuProps["items"] = portfolioOptions.map((opt) => ({
    key: opt.key,
    label: opt.label,
  }));

  const handlePortfolioDropdownClick: MenuProps["onClick"] = ({ key }) => {
    setActivePortfolioSubTab(key);
  };

  const portfolioTabLabel = (
    <div className="flex items-center gap-1">
      <span>{t("profile.tabs.portfolio")}</span>
      {portfolioOptions.length > 1 && (
        <Dropdown
          menu={{ items: portfolioDropdownItems, onClick: handlePortfolioDropdownClick }}
          trigger={["click"]}
        >
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="bg-transparent border-none p-0 m-0 flex items-center cursor-pointer"
          >
            <ChevronDown size={14} />
          </button>
        </Dropdown>
      )}
    </div>
  );

  const tabItems = [
    {
      key: "portfolio",
      label: portfolioTabLabel,
    },
    {
      key: "publications",
      label: t("profile.tabs.publications"),
      children: (
        <div className="space-y-4">
          {postsLoading && <Spin />}
          {postsError && <Alert message={postsError} type="error" />}
          {!postsLoading && !postsError && posts.length === 0 && (
            <div className="text-center text-gray-500 py-8">{t("profile.no_posts")}</div>
          )}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                id: post.backendId ?? String(post.id),
                authorPostId: post.author.id ?? String(post.id),
                authorName: post.author.name,
                uploadedAt: post.createdAt,
                uploadCount: post.userPostId,
                title: post.title,
                content: post.content,
                isWork: post.isWork,
                isLocal: post.isLocal,
                media: post.media.map((m: any) => ({
                  id: m.media.id,
                  url: m.media.path,
                  mimeType: m.media.mimeType,
                  fileName: m.media.fileName,
                  isWorkMedia: m.isWorkMedia,
                  coverUrl: m.media.coverUrl,
                  coverMediaId: m.media.coverMediaId,
                })),
                likesCount: post.likesCount,
                isLikedByCurrentUser: post.isLikedByCurrentUser ?? false,
                isFavoritedByCurrentUser: false,
                isRetweetedByCurrentUser: false,
                repliedToId: post.postRepliedTo ? String(post.postRepliedTo) : null,
                repostOfId: post.postRepostOf ? String(post.postRepostOf) : undefined,
                replies: post.replies ?? [],
              }}
            />
          ))}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Alert message={error || t("profile.not_found")} type="error" showIcon />
      </div>
    );
  }

const profileHeaderData: ProfileData = {
  user: {
    id: profile.id,
    name: profile.displayName || profile.username,
    handle: profile.username,
    avatar: profile.profilePictureUrl ?? undefined,
    isVerified: false,
  },
  bio: profile.biography ?? "",
  followingCount: profile.followingCount ?? 0,
  followersCount: profile.followersCount ?? 0,
  posts: [],
};

return (
  <div className="w-[870px] flex flex-col items-center-safe h-full min-h-screen">
    <div className="w-full h-full bg-transparent">
      <div className="pt-6">
        <ProfileHeader
          variant="public"
          profile={profileHeaderData}
          isFollowing={isFollowing}
          followLoading={followLoading}
          onFollow={handleFollow}
          onOpenDM={() => setDmModalOpen(true)}
          onOpenDonation={handleDonation}
          onOpenFollowers={() => setFollowersModalOpen(true)}
          onOpenFollowing={() => setFollowingModalOpen(true)}
        />

        <div className="w-full flex justify-center relative z-[100] pointer-events-auto">
          <div className="krea-tabs relative z-[100] pointer-events-auto">
            <Tabs
              activeKey={activeMainTab}
              onChange={setActiveMainTab}
              items={tabItems}
              centered
              tabBarStyle={{ borderBottom: "none" }}
              tabBarGutter={46}
            />
          </div>
        </div>
      </div>

      <div
        className={`relative z-0 ${
          activeMainTab === "portfolio" ? "pt-[20px]" : ""
        }`}
      >
        {activeMainTab === "portfolio" && !hasPortfolio && (
          <div className="text-center text-gray-500 py-8">
            {t("profile.no_portfolio")}
          </div>
        )}

        {activeMainTab === "portfolio" &&
          hasPortfolio &&
          activePortfolioSubTab === "images" && (
            <div className="w-screen relative z-0 left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
              <DigitalPortfolio userId={userId ?? ""} items={visualItems} readOnly />
            </div>
          )}

        {activeMainTab === "portfolio" &&
          hasPortfolio &&
          activePortfolioSubTab === "music" && (
            <div className="w-screen relative z-0 left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pb-[25px]">
              <MusicPortfolio
                songs={musicSongs}
                albums={musicAlbums}
                error={postsError}
                readOnly
              />
            </div>
          )}

        {activeMainTab === "portfolio" &&
          hasPortfolio &&
          activePortfolioSubTab === "literature" && (
            <div className="w-screen relative z-0 left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pb-[25px]">
              <WriterPortfolio
                works={writerWorks}
                collections={writerCollections}
                error={postsError}
                readOnly
              />
            </div>
          )}

        {activeMainTab === "publications" && (
          <div className="space-y-4">
            {postsLoading && <Spin />}

            {postsError && <Alert message={postsError} type="error" />}

            {!postsLoading && !postsError && posts.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                {t("profile.no_posts")}
              </div>
            )}

            {posts.map((post) => (
              <div key={post.id} className="mt-[15px] w-full">
                <PostCard
                  post={{
                    id: post.backendId ?? String(post.id),
                    authorPostId: post.author.id ?? String(post.id),
                    authorName: post.author.name,
                    author: {
                      id: post.author.id ? String(post.author.id) : String(userId),
                      username: post.author.handle ?? profile.username ?? "",
                      displayName: post.author.name ?? profile.displayName ?? "",
                      avatar: post.author.avatar ?? profile.profilePictureUrl ?? "",
                    },
                    uploadedAt: post.createdAt,
                    uploadCount: post.userPostId,
                    title: post.title,
                    content: post.content,
                    genres:
                      (post as any).genres ??
                      (post as any).Genres ??
                      [],
                    isWork: post.isWork,
                    isLocal: post.isLocal,
                    media: post.media.map((m: any) => ({
                      id: m.media.id,
                      url: m.media.path,
                      mimeType: m.media.mimeType,
                      fileName: m.media.fileName,
                      isWorkMedia: m.isWorkMedia,
                      coverUrl: m.media.coverUrl,
                      coverMediaId: m.media.coverMediaId,
                    })),
                    likesCount: post.likesCount,
                    isLikedByCurrentUser: post.isLikedByCurrentUser ?? false,
                    isFavoritedByCurrentUser:
                      post.isFavoritedByCurrentUser ??
                      post.isFavorite ??
                      false,
                    isRetweetedByCurrentUser: false,
                    replies: post.replies ?? [],
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <FollowListModal
        open={followersModalOpen}
        title={t("profile.followers")}
        userId={userId!}
        type="followers"
        onClose={() => setFollowersModalOpen(false)}
      />
      <FollowListModal
        open={followingModalOpen}
        title={t("profile.following")}
        userId={userId!}
        type="following"
        onClose={() => setFollowingModalOpen(false)}
      />
      <DirectMessageModal
        open={dmModalOpen}
        receiverId={userId!}
        receiverName={profile.displayName}
        onClose={() => setDmModalOpen(false)}
      />
    </div>
  </div>
);
}