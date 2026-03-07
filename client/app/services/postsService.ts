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
  // GET /api/Posts?page&pageSize
  getPosts: async (query: PostsQuery = {}) => {
    const params = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    };
    const res = await axiosClient.get<ApiPost[]>("/Posts", { params });
    return res.data;
  },

  // GET /api/Posts/{id}
  getPost: async (id: string) => {
    const res = await axiosClient.get<ApiPost>(`/Posts/${id}`);
    return res.data;
  },

  // POST /api/Posts
  createPost: async (data: CreatePostData) => {
    const res = await axiosClient.post<ApiPost>("/Posts", data);
    return res.data;
  },

  // DELETE /api/Posts/{id}
  deletePost: async (id: string) => {
    await axiosClient.delete(`/Posts/${id}`);
  },

  // GET /api/Posts/user/{authorId}
  getUserPosts: async (authorId: string, query: PostsQuery = {}) => {
    const params = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    };
    const res = await axiosClient.get<ApiPost[]>(`/Posts/user/${authorId}`, {
      params,
    });
    return res.data;
  },

  // POST /api/Posts/{postId}/reply
  replyToPost: async (postId: string, data: ReplyData) => {
    const res = await axiosClient.post(`/Posts/${postId}/reply`, data);
    return res.data; // probablemente devuelve el nuevo post (reply)
  },

  // POST /api/Posts/{postId}/repost
  repost: async (postId: string, data: RepostData) => {
    const res = await axiosClient.post(`/Posts/${postId}/repost`, data);
    return res.data;
  },

  // POST /api/Posts/{postId}/like
  like: async (postId: string, data: LikeData) => {
    const res = await axiosClient.post(`/Posts/${postId}/like`, data);
    return res.data;
  },

  // DELETE /api/Posts/{postId}/like
  unlike: async (postId: string, data: LikeData) => {
    // Nota: DELETE con body no es estándar, pero lo implementamos como pide la API
    const res = await axiosClient.delete(`/Posts/${postId}/like`, { data });
    return res.data;
  },

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