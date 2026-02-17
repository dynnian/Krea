import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "antd";
import { useAuth } from "../contexts/AuthContext";
import UserNavbar from "./UserNavbar";
import Composer from "./Composer";
import FeedTabs from "./FeedTabs";
import PostCard from "./Posts/PostCard";
import { PostType } from "../types/common";
import type { Post } from "../types/post";
import type { Timestamp } from "../types/common";

const { useBreakpoint } = Grid;

// Datos mock adaptados a los tipos reales
const mockPosts: Post[] = [
  {
    id: 1,
    user_post_id: 1,
    type: PostType.IMAGE,
    title: null,
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    is_work: false,
    is_deleted: false,
    is_local: false,
    post_replied_to: null,
    post_repost_of: null,
    created_at: new Date().toISOString() as Timestamp,
    updated_at: new Date().toISOString() as Timestamp,
    author: {
      id: 1,
      name: "Usuario",
      handle: "usuario1",
      avatar: undefined,
      sub: "1",
      email: "usuario1@example.com",
    },
    media: [
      {
        post_id: 1,
        media_id: 101,
        is_work_media: false,
        media: {
          id: 101,
          filename: "imagen.jpg",
          mime_type: "image/jpeg",
          path: "https://placehold.co/596x321",
          file_size: 1024,
          uploaded_at: new Date().toISOString() as Timestamp,
        },
      },
    ],
    likesCount: 24,
    favoritesCount: 5,
  },
  {
    id: 2,
    user_post_id: 2,
    type: null,
    title: null,
    content: "Segundo post sin imagen, solo texto.",
    is_work: false,
    is_deleted: false,
    is_local: false,
    post_replied_to: null,
    post_repost_of: null,
    created_at: new Date(Date.now() - 86400000).toISOString() as Timestamp,
    updated_at: new Date(Date.now() - 86400000).toISOString() as Timestamp,
    author: {
      id: 2,
      name: "Usuario",
      handle: "usuario2",
      avatar: undefined,
      sub: "2",
      email: "usuario2@example.com",
    },
    media: [],
    likesCount: 12,
    favoritesCount: 3,
  },
  {
    id: 3,
    user_post_id: 3,
    type: PostType.AUDIO,
    title: null,
    content: "Mi nueva canción ya disponible. Escúchala aquí:",
    is_work: false,
    is_deleted: false,
    is_local: false,
    post_replied_to: null,
    post_repost_of: null,
    created_at: new Date(Date.now() - 172800000).toISOString() as Timestamp,
    updated_at: new Date(Date.now() - 172800000).toISOString() as Timestamp,
    author: {
      id: 3,
      name: "Músico",
      handle: "musicopro",
      avatar: undefined,
      sub: "3",
      email: "musico@example.com",
    },
    media: [
      {
        post_id: 3,
        media_id: 103,
        is_work_media: false,
        media: {
          id: 103,
          filename: "audio.mp3",
          mime_type: "audio/mpeg",
          path: "../assets/Awaken Pillar Men Theme.mp3",
          file_size: 2048,
          uploaded_at: new Date().toISOString() as Timestamp,
        },
      },
    ],
    likesCount: 45,
    favoritesCount: 12,
  },
  {
    id: 4,
    user_post_id: 4,
    type: PostType.LINK,
    title: null,
    content: "Comparto el link a mi nuevo artículo sobre literatura moderna.",
    is_work: false,
    is_deleted: false,
    is_local: false,
    post_replied_to: null,
    post_repost_of: null,
    created_at: new Date(Date.now() - 259200000).toISOString() as Timestamp,
    updated_at: new Date(Date.now() - 259200000).toISOString() as Timestamp,
    author: {
      id: 4,
      name: "Escritor",
      handle: "escritor",
      avatar: undefined,
      sub: "4",
      email: "escritor@example.com",
    },
    media: [
      {
        post_id: 4,
        media_id: 104,
        is_work_media: false,
        media: {
          id: 104,
          filename: "enlace.txt",
          mime_type: "text/plain",
          path: "https://ejemplo.com/articulo",
          file_size: 512,
          uploaded_at: new Date().toISOString() as Timestamp,
        },
      },
    ],
    likesCount: 18,
    favoritesCount: 4,
  },
];

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const screens = useBreakpoint();

  const [activeTab, setActiveTab] = useState<"forYou" | "following">("forYou");
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Aquí cargarías los posts según usuario y pestaña
    setPosts(mockPosts);
  }, [user, activeTab]);

  const handleNewPost = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  const handleLike = async (postId: number) => {
    console.log("Like", postId);
    // Llamada API real
  };

  const handleRepost = async (postId: number) => {
    console.log("Repost", postId);
  };

  const isMobile = isMounted && !screens.sm;

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#E3E2DE]">
        <div className="h-16 bg-[#1351AA] animate-pulse" />
        <div className="max-w-3xl mx-auto p-4 animate-pulse">
          <div className="h-40 bg-gray-200 rounded-lg mb-6" />
          <div className="h-10 bg-gray-200 rounded-lg mb-6" />
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded-lg" />
            <div className="h-32 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E3E2DE]">
      <UserNavbar />
      <main className="flex justify-center px-2 sm:px-4">
        <div
          className={`
            w-full max-w-[740px]
            ${!isMobile ? "bg-[#E8F1FC] border-l-2 border-r-2 border-[#8F8E8A] px-6 py-6" : "px-2"}
          `}
        >
          {user && <Composer onPost={handleNewPost} />}
          <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} isMobile={isMobile} />
          <div className="space-y-4 sm:space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onRepost={handleRepost}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}