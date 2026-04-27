import axiosClient from "../lib/axios.ts";

export interface UserSearchItem {
  id: string;
  username: string;
  displayName: string;
  biography: string;
  profilePictureUrl: string | null;
  isFollowing: boolean;
}

export interface PostSearchItem {
  id: string;
  authorId: string;
  authorName: string;
  authorProfilePictureUrl: string | null;
  title: string;
  content: string;
  postType: "Image" | "Text" | "Video";
  previewUrl: string | null;
  coverUrl: string | null;
  likesCount: number;
  uploadedAt: string;
}

export interface SearchResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const searchApi = {
  searchUsers: (query: string, page = 1, pageSize = 10) =>
    axiosClient.get<SearchResponse<UserSearchItem>>("/users/search", {
      params: { query, page, pageSize },
    }),
  searchPosts: (query: string, page = 1, pageSize = 10) =>
    axiosClient.get<SearchResponse<PostSearchItem>>("/Posts/search", {
      params: { query, page, pageSize },
    }),
};
