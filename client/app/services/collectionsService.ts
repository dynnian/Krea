import axiosClient from "../lib/axios.ts";

export interface UserCollectionDto {
  id: string;
  title: string;
  itemCount: number;
  updatedAt: string;
}

export interface CreateCollectionRequest {
  ownerId: string;
  title: string;
  description?: string;
}

export interface CreateCollectionResponse {
  id: string;
  title: string;
  description?: string | null;
  itemCount: number;
}

export const collectionsApi = {
  getUserCollections: async (userId: string) => {
    const res = await axiosClient.get<UserCollectionDto[]>(`/collections/user/${userId}`);
    return res.data;
  },

  createCollection: async (data: CreateCollectionRequest) => {
    const res = await axiosClient.post<CreateCollectionResponse>("/collections", data);
    return res.data;
  },

  addPostToCollection: async (collectionId: string, postId: string) => {
    const res = await axiosClient.post(`/collections/${collectionId}/posts`, {
      postId,
    });
    return res.data;
  },

  removePostFromCollection: async (collectionId: string, postId: string) => {
    const res = await axiosClient.delete(`/collections/${collectionId}/posts/${postId}`);
    return res.data;
  },
};