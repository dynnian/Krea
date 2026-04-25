// profile.ts
// deno-lint-ignore-file

export enum PostType {
  IMAGE = "image",
  AUDIO = "audio",
  LINK = "link",
}

export interface Author {
  id?: string;
  name: string;
  handle: string;
  avatar?: string;
  isVerified?: boolean;
}

export interface Media {
  id: string;
  originalFileName: string;
  fileName: string;
  mimeType: string;
  path: string;
  uploadedAt: string;
  coverUrl?: string;
  coverMediaId?: string;
  genres?: string[];
}

export interface PostMedia {
  postId: number;
  mediaId: string;
  isWorkMedia: boolean;
  media: Media;
}

export interface Post {
  id: number;
  userPostId: number;
  type: PostType;
  genres?: string[];
  title: string | null;
  content: string;
  isWork: boolean;
  isDeleted: boolean;
  isLocal: boolean;
  postRepliedTo: number | null;
  postRepostOf: number | null;
  createdAt: string;
  updatedAt: string;
  author: Author;
  media: PostMedia[];
  likesCount: number;
  favoritesCount: number;
  replies: any[];
  backendId?: string;
  isLikedByCurrentUser?: boolean;
  isFavorite?: boolean;
  isFavoritedByCurrentUser?: boolean;
}

export interface ProfileData {
  user: Author;
  bio: string;
  followingCount: number;
  followersCount: number;
  isFollowing?: boolean;
  isSubscribed?: boolean;
  posts: Post[];
}

export interface VisualPortfolioItem {
  id: string;
  title: string;
  imageUrl: string;
}

export interface ApiPostMedia {
  id: string;
  fileName: string;
  mimeType: string;
  url: string;
  isWorkMedia: boolean;
  coverUrl?: string;
  coverMediaId?: string;
}

export interface ApiPost {
  id?: string;
  postId?: string;
  userId: string;
  authorUsername: string;
  title: string | null;
  content: string;
  createdAt: string;
  media: ApiPostMedia[];
  likesCount?: number;
  favoritesCount?: number;
  isLikedByCurrentUser?: boolean;
}