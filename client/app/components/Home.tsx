import { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Grid, Input, Button, Avatar, Tabs, Divider } from "antd";
import {
  HeartOutlined,
  MessageOutlined,
  RetweetOutlined,
  ShareAltOutlined,
  PictureOutlined,
  LinkOutlined,
  SoundOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import UserNavbar from "./UserNavbar";
import WaveSurfer from 'wavesurfer.js'
import {type AuthUser as User} from "../contexts/AuthContext.tsx"
const { useBreakpoint } = Grid;
const { TextArea } = Input;

// ------------------------------------------------------------
// Tipos
// ------------------------------------------------------------
type PostType = "art" | "literature" | "music";

interface Post {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar?: string;
  };
  content: string;
  media?: {
    type: PostType;
    url: string;
    thumbnail?: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  reposts: number;
}

interface ComposerForm {
  content: string;
}

// ------------------------------------------------------------
// Componente de onda de sonido (WaveSurfer)
// ------------------------------------------------------------
const AudioWaveform = ({ audioUrl }: { audioUrl: string }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!waveformRef.current) return;

    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#1351AA",
      progressColor: "#0B5107",
      cursorColor: "#8F8E8A",
      barWidth: 3,
      barRadius: 3,
      height: 60,
    });

    wavesurferRef.current.load(audioUrl);

    wavesurferRef.current.on("finish", () => setIsPlaying(false));

    return () => {
      wavesurferRef.current?.destroy();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-4 w-full">
      <Button
        shape="circle"
        icon={isPlaying ? "⏸️" : "▶️"}
        onClick={togglePlay}
        className="flex-shrink-0"
      />
      <div ref={waveformRef} className="flex-1" />
    </div>
  );
};

// ------------------------------------------------------------
// Componente de tarjeta de post
// ------------------------------------------------------------
const PostCard = ({ post }: { post: Post }) => {
  const { t } = useTranslation();

  return (
    <article className="flex flex-col w-full gap-2">
      {/* Header: avatar + metadatos */}
      <div className="flex gap-3">
        <Avatar
          src={post.author.avatar}
          icon={!post.author.avatar && "👤"}
          size={48}
          className="bg-white border border-gray-800"
        />
        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-medium text-gray-900">
              {post.author.name}
            </span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">@{post.author.handle}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">{post.createdAt}</span>
            <EllipsisOutlined className="text-gray-500 ml-auto" />
          </div>
          <p className="text-gray-800 text-justify mt-1">{post.content}</p>
        </div>
      </div>

      {/* Media según tipo */}
      {post.media && (
        <div className="ml-[60px] mt-2">
          {post.media.type === "art" && (
            <img
              src={post.media.url}
              alt="Art"
              className="w-full max-h-80 object-cover rounded-lg border border-gray-200"
            />
          )}
          {post.media.type === "literature" && (
            <div className="bg-[#F3F3F1] p-4 rounded-lg border border-[#8F8E8A]">
              <LinkOutlined className="mr-2" />
              <a href={post.media.url} className="text-blue-600 hover:underline">
                {post.media.url}
              </a>
            </div>
          )}
          {post.media.type === "music" && (
            <div className="bg-[#F3F3F1] p-4 rounded-lg border border-[#8F8E8A]">
              <AudioWaveform audioUrl={post.media.url} />
            </div>
          )}
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-6 ml-[60px] mt-2 text-gray-600">
        <button className="flex items-center gap-1 hover:text-blue-600">
          <HeartOutlined />
          <span className="text-sm">{post.likes}</span>
        </button>
        <button className="flex items-center gap-1 hover:text-blue-600">
          <MessageOutlined />
          <span className="text-sm">{post.comments}</span>
        </button>
        <button className="flex items-center gap-1 hover:text-blue-600">
          <RetweetOutlined />
          <span className="text-sm">{post.reposts}</span>
        </button>
        <button className="flex items-center gap-1 hover:text-blue-600">
          <ShareAltOutlined />
        </button>
      </div>
    </article>
  );
};

// ------------------------------------------------------------
// Componente principal Home
// ------------------------------------------------------------
export default function Home({ user }: { user?: User }) {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const screens = useBreakpoint();

  // Estado para el feed
  const [activeTab, setActiveTab] = useState<"forYou" | "following">("forYou");
  const [mediaType, setMediaType] = useState<PostType | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (user) {
      // 🟢 Usuario autenticado: cargar feed personalizado
    //   fetchPersonalizedFeed(user.id).then(setPosts);
    } else {
      // 🟡 Visitante: cargar feed público (ej. trending, recientes)
    //   fetchPublicFeed().then(setPosts);
    }
    setPosts(mockPosts)
  }, [user]);

  // Formulario del compositor
  const { control, handleSubmit, reset } = useForm<ComposerForm>({
    defaultValues: { content: "" },
    mode: "onChange",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isMobile = isMounted && !screens.sm;
  const isDesktop = isMounted && screens.lg;

  // Enviar nuevo post
  const onSubmit = (data: ComposerForm) => {
    if (!data.content.trim() && !mediaType) return;

    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        name: "Usuario",
        handle: "usuario",
        avatar: undefined,
      },
      content: data.content,
      media: mediaType
        ? {
            type: mediaType,
            url:
              mediaType === "art"
                ? "https://placehold.co/596x321"
                : mediaType === "music"
                ? "/assets/audio-sample.mp3"
                : "https://ejemplo.com/articulo",
          }
        : undefined,
      createdAt: new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      }),
      likes: 0,
      comments: 0,
      reposts: 0,
    };

    setPosts([newPost, ...posts]);
    reset({ content: "" });
    setMediaType(null);
  };

  // Evitar hidratación incorrecta
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

  // ------------------------------------------------------------
  // VERSIÓN MÓVIL
  // ------------------------------------------------------------
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#E3E2DE]">
        <UserNavbar />
        <main>
          {/* Compositor móvil */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex gap-3">
              <Avatar size={48} className="bg-white border border-gray-800">
                👤
              </Avatar>
              <div className="flex-1">
                <Controller
                  name="content"
                  control={control}
                  rules={{ required: mediaType ? false : t("home.post_required") }}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      placeholder={t("home.composer_placeholder")}
                      autoSize={{ minRows: 2, maxRows: 6 }}
                      bordered={false}
                      className="text-base bg-gray-50 rounded-lg p-3"
                    />
                  )}
                />
              </div>
            </div>

            {/* Selector de tipo de media */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setMediaType(mediaType === "art" ? null : "art")}
                  className={`p-2 rounded-full ${
                    mediaType === "art" ? "bg-blue-100 text-blue-600" : "text-gray-600"
                  }`}
                >
                  <PictureOutlined className="text-xl" />
                </button>
                <button
                  onClick={() => setMediaType(mediaType === "literature" ? null : "literature")}
                  className={`p-2 rounded-full ${
                    mediaType === "literature" ? "bg-blue-100 text-blue-600" : "text-gray-600"
                  }`}
                >
                  <LinkOutlined className="text-xl" />
                </button>
                <button
                  onClick={() => setMediaType(mediaType === "music" ? null : "music")}
                  className={`p-2 rounded-full ${
                    mediaType === "music" ? "bg-blue-100 text-blue-600" : "text-gray-600"
                  }`}
                >
                  <SoundOutlined className="text-xl" />
                </button>
              </div>
              <Button
                type="primary"
                onClick={handleSubmit(onSubmit)}
                className="bg-[#1351AA] rounded-full px-6"
              >
                {t("home.post_button")}
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab("forYou")}
              className={`flex-1 py-2 text-center font-medium ${
                activeTab === "forYou"
                  ? "text-[#0B5107] border-b-2 border-[#0B5107]"
                  : "text-gray-600"
              }`}
            >
              {t("home.for_you")}
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={`flex-1 py-2 text-center font-medium ${
                activeTab === "following"
                  ? "text-[#0B5107] border-b-2 border-[#0B5107]"
                  : "text-gray-600"
              }`}
            >
              {t("home.following")}
            </button>
          </div>

          {/* Lista de posts */}
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ------------------------------------------------------------
  // VERSIÓN DESKTOP / TABLET
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#E3E2DE]">
      <UserNavbar />
      <main className="flex justify-center px-4">
        {/* Columna central - feed con bordes laterales */}
        <div
          className="w-full max-w-[740px] bg-[#E8F1FC] border-l-2 border-r-2 border-[#8F8E8A] px-6 py-6"
          style={{ borderColor: "#8F8E8A" }}
        >
          {/* Compositor */}
          <div className="flex gap-4 items-start mb-8">
            <Avatar size={64} className="bg-white border border-gray-800">
              👤
            </Avatar>
            <div className="flex-1">
              <Controller
                name="content"
                control={control}
                rules={{ required: mediaType ? false : t("home.post_required") }}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    placeholder={t("home.composer_placeholder")}
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    bordered={false}
                    className="text-lg bg-transparent hover:bg-white/50 transition-colors rounded-lg p-3"
                  />
                )}
              />

              {/* Iconos de adjuntos */}
              <div className="flex items-center gap-6 mt-2">
                <button
                  onClick={() => setMediaType(mediaType === "art" ? null : "art")}
                  className={`p-2 rounded-full transition-colors ${
                    mediaType === "art"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <PictureOutlined className="text-xl" />
                </button>
                <button
                  onClick={() => setMediaType(mediaType === "literature" ? null : "literature")}
                  className={`p-2 rounded-full transition-colors ${
                    mediaType === "literature"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <LinkOutlined className="text-xl" />
                </button>
                <button
                  onClick={() => setMediaType(mediaType === "music" ? null : "music")}
                  className={`p-2 rounded-full transition-colors ${
                    mediaType === "music"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <SoundOutlined className="text-xl" />
                </button>
              </div>
            </div>

            <Button
              type="primary"
              onClick={handleSubmit(onSubmit)}
              className="bg-[#1351AA] rounded-full px-8 h-12 text-lg"
            >
              {t("home.post_button")}
            </Button>
          </div>

          {/* Filtros: Para ti / Siguiente */}
          <div className="flex items-center justify-center gap-12 mb-6 border-b border-[#8F8E8A] pb-2">
            <button
              onClick={() => setActiveTab("forYou")}
              className={`relative pb-2 text-base font-medium ${
                activeTab === "forYou"
                  ? "text-[#0B5107] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-0.5 after:bg-[#0B5107]"
                  : "text-gray-700"
              }`}
            >
              {t("home.for_you")}
            </button>
            <div className="w-px h-6 bg-[#8F8E8A] transform rotate-90" />
            <button
              onClick={() => setActiveTab("following")}
              className={`text-base font-medium ${
                activeTab === "following"
                  ? "text-[#0B5107] border-b-2 border-[#0B5107] pb-2"
                  : "text-gray-700"
              }`}
            >
              {t("home.following")}
            </button>
          </div>

          {/* Lista de posts */}
          <div className="space-y-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ------------------------------------------------------------
// Datos mock para demostración
// ------------------------------------------------------------
const mockPosts: Post[] = [
  {
    id: "1",
    author: {
      name: "Usuario",
      handle: "usuario1",
    },
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis",
    media: {
      type: "art",
      url: "https://placehold.co/596x321",
    },
    createdAt: "15 oct.",
    likes: 24,
    comments: 5,
    reposts: 2,
  },
  {
    id: "2",
    author: {
      name: "Usuario",
      handle: "usuario2",
    },
    content:
      "Segundo post sin imagen, solo texto. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    createdAt: "14 oct.",
    likes: 12,
    comments: 3,
    reposts: 0,
  },
  {
    id: "3",
    author: {
      name: "Músico",
      handle: "musicopro",
    },
    content: "Mi nueva canción ya disponible. Escúchala aquí:",
    media: {
      type: "music",
      url: "/assets/audio-sample.mp3", // Reemplazar con URL real
    },
    createdAt: "13 oct.",
    likes: 45,
    comments: 8,
    reposts: 12,
  },
  {
    id: "4",
    author: {
      name: "Escritor",
      handle: "escritor",
    },
    content: "Comparto el link a mi nuevo artículo sobre literatura moderna.",
    media: {
      type: "literature",
      url: "https://ejemplo.com/articulo",
    },
    createdAt: "12 oct.",
    likes: 18,
    comments: 4,
    reposts: 3,
  },
];