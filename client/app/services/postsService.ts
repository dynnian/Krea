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
} from "../types/api.ts";

export interface PostsQuery {
  page?: number;
  pageSize?: number;
}

export const postsApi = {
  // Obtener todos los posts (paginado)
  getPosts: (page = 1, pageSize = 20) =>
    axiosClient.get<PostDto[]>("/api/Posts", { params: { page, pageSize } }),

  // Obtener un post por ID
  getPost: (id: string) => axiosClient.get<PostDto>(`/api/Posts/${id}`),

  // Crear un post
  createPost: (data: CreatePostCommand) =>
    axiosClient.post<{ postId: string }>("/api/Posts", data),

  // Eliminar post
  deletePost: (postId: string) => axiosClient.delete(`/api/Posts/${postId}`),

  // Obtener posts de un usuario
  getUserPosts: (authorId: string, page = 1, pageSize = 20) =>
    axiosClient.get<PostDto[]>(`/api/Posts/user/${authorId}`, {
      params: { page, pageSize },
    }),

  // Responder (comentar)
  replyToPost: (postId: string, data: ReplyPostCommand) =>
    axiosClient.post<{ postId: string }>(`/api/Posts/${postId}/reply`, data),

  // Repostear
  repost: (postId: string, data: RepostPostCommand) =>
    axiosClient.post(`/api/Posts/${postId}/repost`, data),

  // Like
  like: (postId: string, data: LikePostCommand) =>
    axiosClient.post(`/api/Posts/${postId}/like`, data),

  // Unlike
  unlike: (postId: string, data: LikePostCommand) =>
    axiosClient.delete(`/api/Posts/${postId}/unlike`, { data }),

  // POST /api/Posts/{postId} (subida de medios)
  uploadMedia: async (postId: string, data: UploadMediaData) => {
    const formData = new FormData();
    formData.append("File", data.File);
    formData.append("Type", data.Type);
    formData.append("Title", data.Title);

    if (data.Description) formData.append("Description", data.Description);
    if (data.IsWorkMedia !== undefined)
      formData.append("IsWorkMedia", data.IsWorkMedia.toString());

    // Imagen
    if (data.Width !== undefined)
      formData.append("Width", data.Width.toString());
    if (data.Height !== undefined)
      formData.append("Height", data.Height.toString());
    if (data.Format) formData.append("Format", data.Format);

    // Música
    if (data.BitrateKbps !== undefined)
      formData.append("BitrateKbps", data.BitrateKbps.toString());
    if (data.DurationSec !== undefined)
      formData.append("DurationSec", data.DurationSec.toString());

    // Texto
    if (data.WordCount !== undefined)
      formData.append("WordCount", data.WordCount.toString());
    if (data.SortTitle) formData.append("SortTitle", data.SortTitle);
    if (data.Subtitle) formData.append("Subtitle", data.Subtitle);
    if (data.LanguageCode) formData.append("LanguageCode", data.LanguageCode); // seguro porque verificamos

    // Comunes
    if (data.FileSize !== undefined)
      formData.append("FileSize", data.FileSize.toString());
    if (data.GenreIds?.length) {
      data.GenreIds.forEach((id) => formData.append("GenreIds", id));
    }

    const res = await axiosClient.post(`/Posts/${postId}/uploads`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  // Obtener comentarios (replies) de un post – ¡NUEVO!
  getReplies: (postId: string, page = 1, pageSize = 20) =>
    axiosClient.get<PostDto[]>(`/api/Posts/${postId}/replies`, {
      params: { page, pageSize },
    }),

  // Explorar contenido
  explore: (params: {
    category?: string;
    genres?: string[];
    tags?: string[];
    sortBy?: string;
    page?: number;
    pageSize?: number;
  }) => axiosClient.get<PostDto[]>("/api/Posts/explore", { params }),
};

export const feedApi = {
  // GET /api/feed/recent?currentUserId&page&pageSize
  getRecent: async (
    currentUserId?: string,
    page: number = 1,
    pageSize: number = 20,
  ) => {
    const params: any = { page, pageSize };
    if (currentUserId) params.currentUserId = currentUserId;
    const res = await axiosClient.get<FeedPost[]>("/feed/recent", { params });
    return res.data;
  },

  // GET /api/feed/following?currentUserId&page&pageSize
  getFollowing: async (
    currentUserId: string,
    page: number = 1,
    pageSize: number = 20,
  ) => {
    const params = { currentUserId, page, pageSize };
    const res = await axiosClient.get<FeedPost[]>("/feed/following", {
      params,
    });
    return res.data;
  },
};