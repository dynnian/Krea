// app/services/postsService.ts
import axiosClient from "../lib/axios";
import {
  type ApiPost,
  type CreatePostData,
  type ReplyData,
  type RepostData,
  type LikeData,
  type UploadMediaData,
  type FeedPost,
  type PostDto,
  type PaginatedReplies,
  type ExplorePostDto,
  type TrendingResponse,
} from "../types/api.ts";
import type { FeedItem } from "../types/feed.ts";
import type { ReplyDto } from "./comments.ts";

export interface PostsQuery {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const postsApi = {
  // Obtener todos los posts (paginado)
  getPosts: (page = 1, pageSize = 20) =>
    axiosClient.get<PostDto[]>("/Posts", { params: { page, pageSize } }),

  // Obtener un post por ID
  getPost: (id: string) => axiosClient.get<PostDto>(`/Posts/${id}`),

  // Crear un post
  createPost: (
    data: any, // usamos any por simplicidad, pero puedes tipar
  ) => axiosClient.post<{ postId: string }>("/Posts", data),

  // Eliminar post
  deletePost: (postId: string) => axiosClient.delete(`/Posts/${postId}`),

  // Obtener posts de un usuario
  getUserPosts: (authorId: string, page = 1, pageSize = 20) =>
    axiosClient.get<PostDto[]>(`/Posts/user/${authorId}`, {
      params: { page, pageSize },
    }),

  // Repostear
  repost: (
    postId: string,
    data: { authorId: string; originalPostId: string },
  ) => axiosClient.post(`/Posts/${postId}/repost`, data),

  // Like
  like: (postId: string, data: { postId: string; userId: string }) =>
    axiosClient.post(`/Posts/${postId}/like`, data),

  // Unlike
  unlike: (postId: string, data: { postId: string; userId: string }) =>
    axiosClient.delete(`/Posts/${postId}/unlike`, { data }),

  // Subir archivo multimedia – ya está bien
  uploadMedia: (postId: string, data: any) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "File") formData.append(key, value as File);
        else if (Array.isArray(value))
          value.forEach((v) => formData.append(key, v));
        else formData.append(key, String(value));
      }
    });
    return axiosClient.post(`/Posts/${postId}/uploads`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Obtener comentarios (replies)
  getReplies: (postId: string, page = 1, pageSize = 20) =>
    axiosClient.get<ReplyDto[]>(`/Posts/${postId}/replies`, {
      params: { page, pageSize },
    }),

  // Responder (comentar) – asumimos que la respuesta devuelve el nuevo ReplyDto
  replyToPost: (
    postId: string,
    data: {
      authorId: string;
      replyToPostId: string;
      title: string;
      content: string;
    },
  ) => axiosClient.post<{ postId: string }>(`/Posts/${postId}/reply`, data),
  // Explorar contenido
  explore: (params: {
    category?: "Image" | "Music" | "Text";
    genres?: string[];
    tags?: string[];
    sortBy?: string;
    page?: number;
    pageSize?: number;
  }) =>
    axiosClient.get<PaginatedResponse<ExplorePostDto>>("/Posts/explore", {
      params,
    }),

  toggleFavorite: (postId: string) =>
    axiosClient.post(`/Posts/${postId}/favorite/toggle`),

  getFavorites: async (page = 1, pageSize = 20) => {
    const response = await axiosClient.get("/Posts/me/favorites", {
      params: { page, pageSize },
    });
    const data = response.data;
    // Extraer el array de items (paginado) o devolver array vacío
    const postsArray = data?.items ?? [];
    return {
      data: postsArray,
      page: data.page ?? 1,
      pageSize: data.pageSize ?? postsArray.length,
      totalCount: data.totalCount ?? postsArray.length,
      totalPages: data.totalPages ?? 1,
    };
  },
};

export const feedApi = {
  getRecent: (currentUserId?: string, page = 1, pageSize = 20) =>
    axiosClient.get<FeedItem[]>("/feed/recent", {
      params: { currentUserId, page, pageSize },
    }),
  getFollowing: (currentUserId: string, page = 1, pageSize = 20) =>
    axiosClient.get<FeedItem[]>("/feed/following", {
      params: { currentUserId, page, pageSize },
    }),
  getTrending: async () => {
  try {
    const response = await axiosClient.get("/feed/trending");
    // Normalizar respuesta (si es array, extraer primer elemento)
    let data = response.data;
    if (Array.isArray(data) && data.length > 0) {
      data = data[0];
    }
    if (!data || typeof data !== 'object') {
      data = { genres: [], tags: [] };
    }
    return { ...response, data: data as { genres: string[]; tags: string[] } };
  } catch (error) {
    console.warn("Error fetching trending, returning empty", error);
    // Retornar un objeto vacío en lugar de lanzar error
    return { data: { genres: [], tags: [] } } as any;
  }
},
};