import { PostType } from "../types/common";
import type { Post } from "../types/post";
import type { AuthUser } from "../contexts/AuthContext";

// Autores de ejemplo (enriquecidos con id, name, handle, etc.)
const authors: AuthUser[] = [
  {
    id: 1,
    sub: "1",
    email: "artista@example.com",
    name: "Artista Visual",
    handle: "artista",
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    id: 2,
    sub: "2",
    email: "musico@example.com",
    name: "Músico Pro",
    handle: "musicopro",
    avatar: "https://i.pravatar.cc/150?u=2",
  },
  {
    id: 3,
    sub: "3",
    email: "escritor@example.com",
    name: "Escritor Creativo",
    handle: "escritor",
    avatar: "https://i.pravatar.cc/150?u=3",
  },
  {
    id: 4,
    sub: "4",
    email: "usuario@example.com",
    name: "Usuario Regular",
    handle: "usuario",
    avatar: undefined,
  },
];

// Helper para crear timestamps ISO
const now = new Date();
const oneDay = 24 * 60 * 60 * 1000;

export const mockPosts: Post[] = [
  // ------------------------------------------------------------
  // Post de imagen (type: IMAGE) con múltiples imágenes
  // ------------------------------------------------------------
  {
    id: 1,
    user_post_id: 1,
    type: PostType.IMAGE,
    title: null,
    content: "Mi última ilustración. Espero que les guste. #Arte #Digital",
    is_work: false,
    is_deleted: false,
    is_local: false,
    post_replied_to: null,
    post_repost_of: null,
    created_at: new Date(now.getTime() - oneDay).toISOString(),
    updated_at: new Date(now.getTime() - oneDay).toISOString(),
    author: authors[0],
    media: [
      {
        post_id: 1,
        media_id: 101,
        is_work_media: false,
        media: {
          id: 101,
          filename: "ilustracion1.jpg",
          mime_type: "image/jpeg",
          path: "https://images.unsplash.com/photo-1575995872537-3793d29d972c?q=80&w=724&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          file_size: 1024 * 500,
          uploaded_at: new Date(now.getTime() - oneDay).toISOString(),
        },
      },
      {
        post_id: 1,
        media_id: 102,
        is_work_media: false,
        media: {
          id: 102,
          filename: "ilustracion2.jpg",
          mime_type: "image/jpeg",
          path: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600",
          file_size: 1024 * 600,
          uploaded_at: new Date(now.getTime() - oneDay).toISOString(),
        },
      },
      {
        post_id: 1,
        media_id: 103,
        is_work_media: false,
        media: {
          id: 103,
          filename: "ilustracion3.jpg",
          mime_type: "image/jpeg",
          path: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600",
          file_size: 1024 * 550,
          uploaded_at: new Date(now.getTime() - oneDay).toISOString(),
        },
      },
    ],
    likesCount: 42,
    favoritesCount: 15,
    replies: [], // se pueden agregar después
  },
  // ------------------------------------------------------------
  // Post de audio (type: AUDIO) con carátula
  // ------------------------------------------------------------
  {
    id: 2,
    user_post_id: 2,
    type: PostType.AUDIO,
    title: "Mi nueva canción",
    content:
      "Ya pueden escuchar mi nuevo tema 'Amanecer' en todas las plataformas.",
    is_work: true,
    is_deleted: false,
    is_local: false,
    post_replied_to: null,
    post_repost_of: null,
    created_at: new Date(now.getTime() - 2 * oneDay).toISOString(),
    updated_at: new Date(now.getTime() - 2 * oneDay).toISOString(),
    author: authors[1],
    media: [
      {
        post_id: 2,
        media_id: 201,
        is_work_media: true,
        media: {
          id: 201,
          filename: "amanecer.mp3",
          mime_type: "audio/mpeg",
          path: "/assets/audio-sample.mp3", // ruta local de ejemplo
          file_size: 1024 * 3000,
          uploaded_at: new Date(now.getTime() - 2 * oneDay).toISOString(),
        },
      },
      {
        post_id: 2,
        media_id: 202,
        is_work_media: false,
        media: {
          id: 202,
          filename: "caratula.jpg",
          mime_type: "image/jpeg",
          path: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400",
          file_size: 1024 * 200,
          uploaded_at: new Date(now.getTime() - 2 * oneDay).toISOString(),
        },
      },
    ],
    likesCount: 128,
    favoritesCount: 45,
    replies: [],
  },
  // ------------------------------------------------------------
  // Post de link (type: LINK)
  // ------------------------------------------------------------
  {
    id: 3,
    user_post_id: 3,
    type: PostType.LINK,
    title: null,
    content:
      "Recomiendo este artículo sobre literatura moderna: https://ejemplo.com/articulo",
    is_work: false,
    is_deleted: false,
    is_local: false,
    post_replied_to: null,
    post_repost_of: null,
    created_at: new Date(now.getTime() - 3 * oneDay).toISOString(),
    updated_at: new Date(now.getTime() - 3 * oneDay).toISOString(),
    author: authors[2],
    media: [
      {
        post_id: 3,
        media_id: 301,
        is_work_media: false,
        media: {
          id: 301,
          filename: "articulo.txt",
          mime_type: "text/plain",
          path: "https://ejemplo.com/articulo",
          file_size: 1024,
          uploaded_at: new Date(now.getTime() - 3 * oneDay).toISOString(),
        },
      },
    ],
    likesCount: 23,
    favoritesCount: 7,
    replies: [],
  },
  // ------------------------------------------------------------
  // Post de texto (type: TEXT) sin media
  // ------------------------------------------------------------
  {
    id: 4,
    user_post_id: 4,
    type: PostType.TEXT,
    title: null,
    content: "Hoy es un buen día para escribir. ¿Qué están leyendo?",
    is_work: false,
    is_deleted: false,
    is_local: false,
    post_replied_to: null,
    post_repost_of: null,
    created_at: new Date(now.getTime() - 4 * oneDay).toISOString(),
    updated_at: new Date(now.getTime() - 4 * oneDay).toISOString(),
    author: authors[3],
    media: [],
    likesCount: 10,
    favoritesCount: 2,
    replies: [],
  },
  // ------------------------------------------------------------
  // Post de imagen (type: IMAGE) con una sola imagen
  // ------------------------------------------------------------
  {
    id: 5,
    user_post_id: 1,
    type: PostType.IMAGE,
    title: null,
    content: "Boceto rápido del día.",
    is_work: false,
    is_deleted: false,
    is_local: false,
    post_replied_to: null,
    post_repost_of: null,
    created_at: new Date(now.getTime() - 5 * oneDay).toISOString(),
    updated_at: new Date(now.getTime() - 5 * oneDay).toISOString(),
    author: authors[0],
    media: [
      {
        post_id: 5,
        media_id: 501,
        is_work_media: false,
        media: {
          id: 501,
          filename: "boceto.jpg",
          mime_type: "image/jpeg",
          path: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600",
          file_size: 1024 * 400,
          uploaded_at: new Date(now.getTime() - 5 * oneDay).toISOString(),
        },
      },
    ],
    likesCount: 31,
    favoritesCount: 9,
    replies: [],
  },
  // ------------------------------------------------------------
  // Post de audio (type: AUDIO) sin carátula
  // ------------------------------------------------------------
  {
    id: 6,
    user_post_id: 2,
    type: PostType.AUDIO,
    title: "Podcast episodio 1",
    content: "Primer episodio de mi podcast sobre música.",
    is_work: false,
    is_deleted: false,
    is_local: false,
    post_replied_to: null,
    post_repost_of: null,
    created_at: new Date(now.getTime() - 6 * oneDay).toISOString(),
    updated_at: new Date(now.getTime() - 6 * oneDay).toISOString(),
    author: authors[1],
    media: [
      {
        post_id: 6,
        media_id: 601,
        is_work_media: true,
        media: {
          id: 601,
          filename: "podcast.mp3",
          mime_type: "audio/mpeg",
          path: "/assets/audio-sample.mp3",
          file_size: 1024 * 5000,
          uploaded_at: new Date(now.getTime() - 6 * oneDay).toISOString(),
        },
      },
    ],
    likesCount: 67,
    favoritesCount: 21,
    replies: [],
  },
];
