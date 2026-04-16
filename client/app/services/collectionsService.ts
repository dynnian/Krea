import axiosClient from "../lib/axios.ts";

export type CollectionType = 0 | 1 | 2;

export interface UserCollectionDto {
  id: string;
  title: string;
  itemCount: number;
  type: CollectionType;
  updatedAt: string;
  coverMediaId?: string | null;
  coverUrl?: string | null;
}

export interface CreateCollectionRequest {
  ownerId: string;
  title: string;
  description?: string;
  type: CollectionType | number;
}

export interface CreateCollectionResponse {
  id: string;
  title: string;
  description?: string | null;
  itemCount: number;
  type: CollectionType;
}

export interface CollectionPostDto {
  id: string;
  title: string;
  authorId: string;
  uploadedAt: string;
  mediaPreviewUrl: string | null;
}

export interface CollectionDetailDto {
  id: string;
  title: string;
  description?: string | null;
  ownerId: string;
  itemCount: number;
  type: CollectionType;
  createdAt: string;
  coverMediaId?: string | null;
  coverUrl?: string | null;
  posts: CollectionPostDto[];
}

export interface CollectionPostDto {
  id: string;
  title: string;
  authorId: string;
  uploadedAt: string;
  mediaPreviewUrl: string | null;
}

export interface CollectionDetailDto {
  id: string;
  title: string;
  description?: string | null;
  ownerId: string;
  itemCount: number;
  type: CollectionType;
  createdAt: string;
  posts: CollectionPostDto[];
}

export const collectionsApi = {
  getUserCollections: async (userId: string) => {
    const res = await axiosClient.get<UserCollectionDto[]>(`/collections/user/${userId}`);
    return res.data;
  },

  getCollectionById: async (collectionId: string, page = 1, pageSize = 50) => {
    const res = await axiosClient.get<CollectionDetailDto>(`/collections/${collectionId}`, {
      params: { page, pageSize },
    });
    return res.data;
  },

  createCollection: async (data: CreateCollectionRequest) => {
    const formData = new FormData();
    formData.append("title", data.title);

    if (data.description) {
      formData.append("description", data.description);
    }

    formData.append("type", String(data.type));

    const res = await axiosClient.post<CreateCollectionResponse>(
      "/collections",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

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

  deleteCollection: async (collectionId: string) => {
    const res = await axiosClient.delete(`/collections/${collectionId}`);
    return res.data;
  },

  uploadCollectionCover: async (collectionId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosClient.post<{ mediaId: string; url: string }>(
      `/collections/${collectionId}/cover`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  },

  updateCollectionTitle: async (collectionId: string, title: string) => {
    const res = await axiosClient.put<{ id: string; title: string; updatedAt: string }>(
      `/collections/${collectionId}/title`,
      { title }
    );

    return res.data;
  },
};

