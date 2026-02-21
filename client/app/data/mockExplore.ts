// data/mockExplore.ts
import { PostType } from '../types/common'; // definición de enum

const now = new Date();
const oneDay = 24 * 60 * 60 * 1000;

export const mockAuthors = [
  {
    id: 1,
    username: 'artista_visual',
    display_name: 'Ana López',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 2,
    username: 'musico_creativo',
    display_name: 'Carlos Méndez',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: 3,
    username: 'escritor_novel',
    display_name: 'Laura García',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
];

export const mockExplorePosts = [
  // Post de imágenes (type: IMAGE)
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
    author: mockAuthors[0],
    media: [
      {
        post_id: 1,
        media_id: 101,
        is_work_media: false,
        media: {
          id: 101,
          filename: "ilustracion1.jpg",
          mime_type: "image/jpeg",
          path: "https://images.unsplash.com/photo-1575995872537-3793d29d972c?q=80&w=724&auto=format&fit=crop",
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
    replies: [],
  },
  // Post de audio (type: AUDIO) con carátula
  {
    id: 2,
    user_post_id: 2,
    type: PostType.AUDIO,
    title: "Mi nueva canción",
    content: "Ya pueden escuchar mi nuevo tema 'Amanecer' en todas las plataformas.",
    is_work: true,
    is_deleted: false,
    is_local: false,
    post_replied_to: null,
    post_repost_of: null,
    created_at: new Date(now.getTime() - 2 * oneDay).toISOString(),
    updated_at: new Date(now.getTime() - 2 * oneDay).toISOString(),
    author: mockAuthors[1],
    media: [
      {
        post_id: 2,
        media_id: 201,
        is_work_media: true,
        media: {
          id: 201,
          filename: "amanecer.mp3",
          mime_type: "audio/mpeg",
          path: "/assets/audio-sample.mp3", // ruta local de ejemplo (asegúrate de tener un archivo)
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
  // Post de link (type: LINK) - puede representar literatura externa
  {
    id: 3,
    user_post_id: 3,
    type: PostType.LINK,
    title: null,
    content: "Recomiendo este artículo sobre literatura moderna: https://ejemplo.com/articulo",
    is_work: false,
    is_deleted: false,
    is_local: false,
    post_replied_to: null,
    post_repost_of: null,
    created_at: new Date(now.getTime() - 3 * oneDay).toISOString(),
    updated_at: new Date(now.getTime() - 3 * oneDay).toISOString(),
    author: mockAuthors[2],
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
];