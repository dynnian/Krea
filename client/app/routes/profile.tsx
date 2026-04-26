// profile.tsx
// deno-lint-ignore-file
import React, { useEffect, useState } from 'react';
import { postsApi } from "../services/postsService.ts";
import PostCard from "../components/Posts/PostCard.tsx";
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tabs, Typography, Grid, message, Spin, Dropdown } from 'antd';
import { useAuth } from '../contexts/AuthContext.tsx';
import DigitalPortfolio from "../components/Profile/DigitalPortfolio.tsx";
import EditCollectionView from "../components/Profile/Collections/EditCollectionView.tsx";
import type { MockImageCollection } from "../data/mockImageCollections.ts";
import { collectionsApi } from "../services/collectionsService.ts";
import MusicPortfolio from "../components/Profile/MusicPortfolio.tsx";
import type { MusicAlbum, MusicSong } from "../components/Profile/MusicPortfolio.tsx";
import WriterPortfolio from "../components/Profile/WriterPortfolio.tsx";
import { ChevronDown } from "lucide-react";
import type {
  WriterWork,
  WriterCollectionPreview,
} from "../components/Profile/WriterPortfolio.tsx";
import { settingsRepository } from "../services/settingsRepository.ts";
import CreatePortfolioPostModal from "../components/Posts/CreatePortfolioPostModal.tsx";
import CreateCollectionModal from "../components/Profile/Collections/CreateCollectionModal.tsx";
import axiosClient from "../lib/axios.ts";
import type { UploadMediaType } from "../types/api.ts";
import { PostType as PortfolioPostType } from "../types/common.ts";
import ProfileHeader from "../components/Profile/ProfileHeader.tsx";
import { saveEditedCollectionChanges } from "../utils/saveEditedCollectionChanges.ts";
import type {
  ProfileData,
  VisualPortfolioItem,
} from "../types/profile.ts";
import type { MenuProps } from "antd";
import {
  mapPostsToMusicSongs,
  mapPostsToVisualPortfolioItems,
  mapPostsToWriterWorks,
  normalizeApiPosts,
} from "../utils/profileMapper.ts";

const { useBreakpoint } = Grid;
const { Text } = Typography;



async function fetchMyProfileFromApi() {
  const res = await axiosClient.get("/users/me/profile");
  return res.data;
}

type UserPostsResponse =
  | any[]
  | { items?: any[]; posts?: any[] };

async function fetchPostsByAuthorFromApi(authorId: string) {
  const res = await postsApi.getUserPosts(authorId, 1, 100);
  const data: any = res.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.posts)) return data.posts;

  return [];
}

type EditableCollectionItem = {
  id: string;
  title: string;
  imageUrl?: string | null;
  documentUrl?: string | null;
  mimeType?: string | null;
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
  const [postsError, setPostsError] = useState<string | null>(null);
  const [visualPortfolioItems, setVisualPortfolioItems] = useState<VisualPortfolioItem[]>([]);
  const [musicSongs, setMusicSongs] = useState<MusicSong[]>([]);
  const [musicAlbums, setMusicAlbums] = useState<MusicAlbum[]>([]);
  const [writerWorks, setWriterWorks] = useState<WriterWork[]>([]);
  const [writerCollections, setWriterCollections] = useState<WriterCollectionPreview[]>([]);
  const [editingWriterCollection, setEditingWriterCollection] = useState<MockImageCollection | null>(null);
  const [portfolioSettings, setPortfolioSettings] = useState<{
    imagesEnabled: boolean;
    musicEnabled: boolean;
    literatureEnabled: boolean;
  } | null>(null);
  const username = usernameParam ?? "me";
  const [activeMainTab, setActiveMainTab] = useState('portfolio');
  const portfolioStorageKey = `profile:${username}:lastPortfolioTab`;

const [activePortfolioSubTab, setActivePortfolioSubTab] = useState(() => {
  return localStorage.getItem(portfolioStorageKey) ?? "images";
});
const [modalVisible, setModalVisible] = useState(false);
const [portfolioModalType, setPortfolioModalType] = useState<UploadMediaType>(PortfolioPostType.IMAGE);
const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] = useState(false);
const [editingImageCollection, setEditingImageCollection] = useState<MockImageCollection | null>(null);
const [editingImageMoveTargets, setEditingImageMoveTargets] = useState<
  { id: string; title: string; coverUrl?: string | null }[]
>([]);
const [editingMusicCollection, setEditingMusicCollection] = useState<MockImageCollection | null>(null);

const handleGoToSettings = () => {
  navigate("/settings");
};

const handleGoToSaved = () => {
 navigate("/saved");
};
// Determinar si es el perfil propio (ruta /profile/me)
// const isOwnProfile = username === 'me';

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) {
        setError('No username provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        if (!user) {
          navigate("/login");
          return;
        }

        let nextPostsError: string | null = null;

        let resolvedVisualPortfolioItems: VisualPortfolioItem[] = [];
        let resolvedMusicSongs: MusicSong[] = [];
        let resolvedMusicAlbums: MusicAlbum[] = [];
        let resolvedWriterWorks: WriterWork[] = [];

        //  Fetch perfil 
        const apiProfile = await fetchMyProfileFromApi();

        let literatureCollectionsRaw: Awaited<
          ReturnType<typeof collectionsApi.getUserCollections>
        > = [];

        try {
          const userCollections = await collectionsApi.getUserCollections(apiProfile.id);

          const musicCollections = userCollections.filter((c) => c.type === 1);
          literatureCollectionsRaw = userCollections.filter((c) => c.type === 2);

          resolvedMusicAlbums = musicCollections.map((collection) => ({
            id: collection.id,
            title: collection.title,
            releaseDate: collection.updatedAt,
            songsCount: collection.itemCount,
            coverUrl:
              collection.coverUrl ??
              "https://placehold.co/240x240?text=Album",
            tracks: [],
          }));
        } catch (err) {
          console.error("Error fetching music/literature collections:", err);
        }
        
        //  Fetch posts
        let rawPosts: any[] = [];
        try {
          rawPosts = await fetchPostsByAuthorFromApi(apiProfile.id);
        } catch (err) {
          console.error("Error fetching posts:", err);
          nextPostsError = "No se pudieron cargar las publicaciones";
        }

        //  Normalizar posts
        const resolvedPosts = normalizeApiPosts(
          rawPosts,
          apiProfile.displayName || apiProfile.username,
        );

        // Mapear portfolios
        resolvedVisualPortfolioItems = mapPostsToVisualPortfolioItems(resolvedPosts);
        resolvedMusicSongs = mapPostsToMusicSongs(resolvedPosts);
        resolvedWriterWorks = mapPostsToWriterWorks(resolvedPosts);

        try {
          const literatureCollectionsWithPreview = await Promise.all(
            literatureCollectionsRaw.map(async (collection) => {
              try {
                const detail = await collectionsApi.getCollectionById(collection.id);

                const collectionWorks = detail.posts
                  .map((post) => {
                    const matchingWork = resolvedWriterWorks.find(
                      (work) => work.postId === post.id
                    );

                    if (!matchingWork) return null;

                    return matchingWork;
                  })
                  .filter((work): work is NonNullable<typeof work> => work !== null);

                const latestThreeBooks = collectionWorks.slice(0, 3);

                return {
                  id: collection.id,
                  title: collection.title,
                  workIds: collectionWorks.map((work) => work.id),
                  coverUrl:
                    collection.coverUrl ??
                    collectionWorks[0]?.coverUrl ??
                    "",
                  previewCovers: latestThreeBooks.map((work) => work.coverUrl),
                };
              } catch (collectionError) {
                console.error(
                  "Error loading literature collection preview:",
                  collection.id,
                  collectionError
                );
                return null;
              }
            })
          );

          setWriterCollections(
            literatureCollectionsWithPreview.filter(
              (collection): collection is WriterCollectionPreview =>
                collection !== null && !!collection.coverUrl
            )
          );
        } catch (error) {
          console.error("Error resolving literature collections with works:", error);
          setWriterCollections([]);
        }


        const profileData: ProfileData = {
          user: {
            id: apiProfile.id,
            name: apiProfile.displayName || apiProfile.username,
            handle: apiProfile.username,
            avatar: apiProfile.profilePictureUrl ?? apiProfile.ProfilePictureUrl ?? undefined,
            isVerified: true,
          },
          bio: apiProfile.biography ?? "",
          followingCount: apiProfile.followingCount ?? apiProfile.FollowingCount ?? 0,
          followersCount: apiProfile.followersCount ?? apiProfile.FollowersCount ?? 0,
          posts: resolvedPosts,
        };
        // Set states
        setProfile(profileData);
        setVisualPortfolioItems(resolvedVisualPortfolioItems);
        setMusicSongs(resolvedMusicSongs);
        setMusicAlbums(resolvedMusicAlbums);
        setWriterWorks(resolvedWriterWorks);
        setPostsError(nextPostsError);
        setError(null);
      } catch (err: any) {
        console.error("loadProfile error:", err);
        console.error("response data:", err?.response?.data);
        console.error("response status:", err?.response?.status);
        setVisualPortfolioItems([]);
        setMusicSongs([]);
        setMusicAlbums([]);
        setWriterWorks([]);
        setWriterCollections([]);
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, user, navigate]);


    useEffect(() => {
      const loadPortfolioSettings = async () => {
        const settings = await settingsRepository.getSettings();
        setPortfolioSettings(settings.portfolio);
      };

    void loadPortfolioSettings();
  }, []);

  useEffect(() => {
    localStorage.setItem(portfolioStorageKey, activePortfolioSubTab);
  }, [portfolioStorageKey, activePortfolioSubTab]);

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



const hasIntegratedPortfolioSettings =
  portfolioSettings &&
  (
    portfolioSettings.imagesEnabled ||
    portfolioSettings.musicEnabled ||
    portfolioSettings.literatureEnabled
  );

const portfolioOptions = hasIntegratedPortfolioSettings
  ? [
      ...(portfolioSettings.imagesEnabled
        ? [{ key: "images", label: "Imágenes" }]
        : []),
      ...(portfolioSettings.musicEnabled
        ? [{ key: "music", label: "Música" }]
        : []),
      ...(portfolioSettings.literatureEnabled
        ? [{ key: "literature", label: "Literatura" }]
        : []),
    ]
  : [
      { key: "images", label: "Imágenes" },
      { key: "music", label: "Música" },
      { key: "literature", label: "Literatura" },
    ];


const effectivePortfolioTab =
  portfolioOptions.find((tab) => tab.key === activePortfolioSubTab)?.key ??
  portfolioOptions[0]?.key ??
  "images";

const portfolioDropdownItems: MenuProps["items"] = portfolioOptions.map((tab) => ({
  key: tab.key,
  label: tab.label,
}));

const handlePortfolioTabClick = () => {
  setActiveMainTab("portfolio");

  if (!portfolioOptions.some((tab) => tab.key === activePortfolioSubTab)) {
    setActivePortfolioSubTab(portfolioOptions[0]?.key ?? "images");
  }
};

const handlePortfolioDropdownClick: MenuProps["onClick"] = ({ key }) => {
  setActiveMainTab("portfolio");
  setActivePortfolioSubTab(String(key));
};

const mainTabItems = [
  {
    key: "portfolio",
    label: (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePortfolioTabClick();
          }}
          className="bg-transparent border-none p-0 m-0 cursor-pointer"
        >
          {t("Portafolio")}
        </button>

        {portfolioOptions.length > 1 && (
          <Dropdown
            menu={{
              items: portfolioDropdownItems,
              onClick: handlePortfolioDropdownClick,
            }}
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
    ),
  },
    { key: "publications", label: t("Publicaciones") },
    { key: "members", label: t("Miembros") },
  ];

const getFilteredPosts = () => {
  if (!profile) return [];

  let posts = profile.posts;

  if (activeMainTab === "members") {
    posts = [];
  } else if (activeMainTab === "portfolio") {
    posts = [];
  }

  return posts;
};
  const filteredPosts = getFilteredPosts();
  const isPortfolioView = activeMainTab === "portfolio";

const handleUpdatePortfolioClick = () => {
  if (activePortfolioSubTab === "images") {
    setPortfolioModalType(PortfolioPostType.IMAGE);
  } else if (activePortfolioSubTab === "literature") {
    setPortfolioModalType(PortfolioPostType.TEXT);
  } else if (activePortfolioSubTab === "music") {
    setPortfolioModalType(PortfolioPostType.MUSIC);
  }

  setModalVisible(true);
};

const collectionModalItemsByType = {
  images: visualPortfolioItems.map((item) => ({
    id: item.id,
    title: item.title,
  })),
  music: musicSongs.map((song) => ({
    id: song.postId,
    title: song.title,
  })),
  literature: writerWorks.map((work) => ({
    id: work.postId,
    title: work.title,
  })),
};




const getEditingCollectionConfig = () => {
  if (editingImageCollection) {
    return {
      collection: editingImageCollection,
      allItems: visualPortfolioItems,
      moveTargets: editingImageMoveTargets,
      collectionType: undefined,
      onCancel: () => {
        setEditingImageCollection(null);
        setEditingImageMoveTargets([]);
      },
      onSave: async ({
        updatedCollection,
        stagedMoves,
        coverFile,
      }: {
        updatedCollection: MockImageCollection;
        stagedMoves: Record<string, EditableCollectionItem[]>;
        coverFile?: File | null;
      }) => {
        try {
          await saveEditedCollectionChanges({
            originalCollection: editingImageCollection,
            updatedCollection,
            stagedMoves: stagedMoves as any,
            entityLabel: "la colección",
          });

          if (coverFile) {
            await collectionsApi.uploadCollectionCover(
              editingImageCollection.id,
              coverFile
            );
          }

          setEditingImageCollection(null);
          setEditingImageMoveTargets([]);
          window.location.reload();
        } catch (error) {
          console.error("Error saving edited image collection:", error);
          message.error("No se pudieron guardar los cambios de la colección.");
        }
      },
    };
  }

  if (editingWriterCollection) {
    return {
      collection: editingWriterCollection,
      allItems: writerWorks.map((work) => ({
        id: work.postId,
        title: work.title,
        imageUrl: work.coverUrl ?? undefined,
        documentUrl: work.documentUrl ?? undefined,
        mimeType: work.mimeType ?? undefined,
      })),
      moveTargets: writerCollections
        .filter((collection) => collection.id !== editingWriterCollection.id)
        .map((collection) => ({
          id: collection.id,
          title: collection.title,
          coverUrl: collection.coverUrl ?? undefined,
        })),
      collectionType: "literature" as const,
      onCancel: () => setEditingWriterCollection(null),
        onSave: async ({
          updatedCollection,
          stagedMoves,
          coverFile,
        }: {
          updatedCollection: MockImageCollection;
          stagedMoves: Record<string, EditableCollectionItem[]>;
          coverFile?: File | null;
        }) => {
        try {
          await saveEditedCollectionChanges({
            originalCollection: editingWriterCollection,
            updatedCollection,
            stagedMoves: stagedMoves as any,
            entityLabel: "la colección",
          });

          if (coverFile) {
            await collectionsApi.uploadCollectionCover(
              editingWriterCollection.id,
              coverFile
            );
          }

          setEditingWriterCollection(null);
          window.location.reload();
        } catch (error) {
          console.error("Error saving edited writer collection:", error);
          message.error("No se pudieron guardar los cambios de la colección.");
        }
      },
    };
  }

  if (editingMusicCollection) {
    return {
      collection: editingMusicCollection,
      allItems: musicSongs.map((song) => ({
        id: song.postId,
        title: song.title,
        imageUrl: song.coverUrl,
      })),
      moveTargets: musicAlbums
        .filter((album) => album.id !== editingMusicCollection.id)
        .map((album) => ({
          id: album.id,
          title: album.title,
          coverUrl: album.coverUrl ?? undefined,
        })),
      collectionType: "music" as const,
      onCancel: () => setEditingMusicCollection(null),
      onSave: async ({
        updatedCollection,
        stagedMoves,
        coverFile,
      }: {
        updatedCollection: MockImageCollection;
        stagedMoves: Record<string, EditableCollectionItem[]>;
        coverFile?: File | null;
        }) => {
        try {
          await saveEditedCollectionChanges({
            originalCollection: editingMusicCollection,
            updatedCollection,
            stagedMoves: stagedMoves as any,
            entityLabel: "el album",
          });

          if (coverFile) {
            await collectionsApi.uploadCollectionCover(
              editingMusicCollection.id,
              coverFile
            );
          }

          setEditingMusicCollection(null);
          window.location.reload();
        } catch (error) {
          console.error("Error saving edited music collection:", error);
          message.error("No se pudieron guardar los cambios del album.");
        }
      },
    };
  }

  return null;
};

const editingCollectionConfig = getEditingCollectionConfig();

  if (editingCollectionConfig) {
    return (
      <div className="w-full min-h-screen bg-[#E3E2DE]">
        <EditCollectionView
          collection={editingCollectionConfig.collection}
          allItems={editingCollectionConfig.allItems}
          moveTargets={editingCollectionConfig.moveTargets?.map((target) => ({
            id: target.id,
            title: target.title,
            coverUrl: target.coverUrl ?? undefined,
          }))}
          collectionType={editingCollectionConfig.collectionType}
          onCancel={editingCollectionConfig.onCancel}
          onSave={editingCollectionConfig.onSave}
        />
      </div>
    );
  }

 return (
  <div className="w-[870px] flex flex-col items-center-safe h-full min-h-screen">
    <div
    className={`w-full h-full ${
      isPortfolioView
        ? "bg-transparent border-none"
        : "bg-transparent "
    }`}
  >
    <div className=" pt-6 ">
      {/* Perfil header */}
      <ProfileHeader
        profile={profile}
        onGoToSettings={handleGoToSettings}
        onGoToSaved={handleGoToSaved}
      />
      <div className="w-full flex justify-center">
        <div className=" krea-tabs">
          <Tabs
            activeKey={activeMainTab}
            onChange={(key) => {
              if (key === "portfolio") {
                handlePortfolioTabClick();
                return;
              }

              setActiveMainTab(key);
            }}
            items={mainTabItems}
            centered={!isMobile}
            tabBarStyle={{ borderBottom: "none" }}
            tabBarGutter={46}
          />
        </div>
      </div>

{activeMainTab === "portfolio" && (
  <>

    {activeMainTab === "portfolio" && (
      
      <div className="lg:pl-[70px]  md:mt-[-10px] mb-[10px] flex justify-end pr-[0px]">
        <div className="w-full flex justify-center mt-[32px] md:mt-0 md:pl-[520px]">
        <div className="flex items-center gap-[10px] md:-mt-[30px] relative z-20 md:translate-x-[55px]">
        <button
          type="button"
          onClick={() => {
            setIsCreateCollectionModalOpen(true);
          }}
          className="rounded-full bg-[#0B5107] cursor-pointer transition hover:bg-[#093B05] px-[14px] py-[6px] text-[11px] border border-[#1B1C1E]"
        >
          <span className="text-[13px] font-medium leading-5 text-[#E3E2DE]">
            Crear colección
          </span>
        </button>

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
      </div>
    )}
    </>
    )}
  </div> 

  <div className={` ${
      isPortfolioView
        ? "pt-[20px]"
        : ""
    }`}
  >

    {activeMainTab === "portfolio" && effectivePortfolioTab === "images" && (
     <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
    <DigitalPortfolio
      userId={profile.user.id ?? ""}
      items={visualPortfolioItems}
      onEditCollection={(collection, moveTargets) => {
        setEditingImageCollection(collection);
        setEditingImageMoveTargets(moveTargets);
      }}
    />
     </div>
    )}

    {activeMainTab === "portfolio" && effectivePortfolioTab === "music" && (
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pb-[25px]">
       <MusicPortfolio
        songs={musicSongs}
        albums={musicAlbums}
        error={postsError}
onEditAlbum={async (album) => {
  try {
    const collectionDetail = await collectionsApi.getCollectionById(album.id);

    setEditingMusicCollection({
      id: collectionDetail.id,
      title: collectionDetail.title,
      description: collectionDetail.description ?? "",
      itemCount: collectionDetail.itemCount,
      updatedAt: collectionDetail.createdAt,
      coverUrl: collectionDetail.coverUrl ?? album.coverUrl,
      posts: collectionDetail.posts.map((post) => {
        const matchingSong = musicSongs.find((song) => song.postId === post.id);

        return {
          id: post.id,
          title: post.title,
          imageUrl:
            post.mediaPreviewUrl ??
            matchingSong?.coverUrl ??
            album.coverUrl,
          createdAt: post.uploadedAt,
        };
      }),
    });
  } catch (error) {
    console.error("Error loading album detail for edit:", error);
    message.error("No se pudo cargar el album para editar.");
  }
}}
        />
      </div>
    )}
    
      {activeMainTab === "portfolio" && effectivePortfolioTab === "literature" && (
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pb-[25px]">
          <WriterPortfolio
            works={writerWorks}
            collections={writerCollections}
            error={postsError}
            onEditCollection={async (collectionId) => {
              try {
                const collectionDetail = await collectionsApi.getCollectionById(collectionId);

                setEditingWriterCollection({
                  id: collectionDetail.id,
                  title: collectionDetail.title,
                  description: collectionDetail.description ?? "",
                  itemCount: collectionDetail.itemCount,
                  updatedAt: collectionDetail.createdAt,
                  coverUrl:
                    collectionDetail.coverUrl ??
                    writerCollections.find((collection) => collection.id === collectionId)?.coverUrl ??
                    null,
                  posts: collectionDetail.posts
                    .map((post) => {
                      const matchingWork = writerWorks.find((work) => work.postId === post.id);

                      if (!matchingWork) return null;

                      return {
                        id: post.id,
                        title: post.title,
                        imageUrl:
                          post.mediaPreviewUrl ??
                          matchingWork.coverUrl ??
                          undefined,
                        documentUrl: matchingWork.documentUrl ?? undefined,
                        mimeType: matchingWork.mimeType ?? undefined,
                        createdAt: post.uploadedAt,
                      };
                    })
                    .filter((post): post is NonNullable<typeof post> => post !== null) as any,
                });
              } catch (error) {
                console.error("Error loading literature collection for edit:", error);
                message.error("No se pudo cargar la colección para editar.");
              }
            }}
            onDeleteCollection={async (collectionId) => {
              try {
                await collectionsApi.deleteCollection(collectionId);
                setWriterCollections((prev) =>
                  prev.filter((collection) => collection.id !== collectionId)
                );
                message.success("Colección eliminada.");
              } catch (error) {
                console.error("Error deleting literature collection:", error);
                message.error("No se pudo eliminar la colección.");
              }
            }}
          />
        </div>
      )}

      {activeMainTab !== "portfolio" && (
      <div className="space-y-[] ">
        {activeMainTab === "publications" && postsError ? (
          <div className="text-center text-red-500 py-8">
            {postsError}
          </div>
        ) : (
          <>
            {filteredPosts.map((post) => (
              <div key={post.id} className="mt-[15px] w-full">
                <PostCard
                  post={{
                    id: post.backendId ?? String(post.id),
                    authorPostId: post.author.id ?? String(post.id),
                    authorName: post.author.name,
                    author: {
                      id: post.author.id ? String(post.author.id) : String(profile.user.id),
                      username: post.author.handle ?? profile.user.handle ?? "",
                      displayName: post.author.name ?? profile.user.name ?? "",
                      avatar: post.author.avatar ?? profile.user.avatar ?? "",
                    },
                    uploadedAt: post.createdAt,
                    uploadCount: post.userPostId,
                    title: post.title,
                    content: post.content,
                    isWork: post.isWork,
                    isLocal: post.isLocal,
                    media: post.media.map((m) => ({
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
                  canDelete={activeMainTab === "publications"}
                  onDelete={(deletedPostId) => {
                    setProfile((prev) =>
                      prev
                        ? {
                            ...prev,
                            posts: prev.posts.filter(
                              (p) => (p.backendId ?? String(p.id)) !== deletedPostId
                            ),
                          }
                        : prev
                    );
                  }}
                />
              </div>
            ))}
            {filteredPosts.length === 0 && (
              <div className="text-center text-gray-500 py-8 ">
                {t("profile.no_posts")}
              </div>
            )}
          </>
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
      window.location.reload();
    }}
  />
  <CreateCollectionModal
    open={isCreateCollectionModalOpen}
    onClose={() => setIsCreateCollectionModalOpen(false)}
    ownerId={profile.user.id ?? ""}
    availableItemsByType={collectionModalItemsByType}
    onSuccess={() => {
      setIsCreateCollectionModalOpen(false);
      window.location.reload();
    }}
  />
  </div>
</div>
);
}
export default Profile;