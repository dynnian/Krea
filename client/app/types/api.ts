// app/types/api.ts

import type { ReplyDto } from "../services/comments.ts";
import type { PostType } from "./common";

// Respuesta de login/register (ya existente)
export interface AuthResponse {
  token: string;
  expiration: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  displayName: string;
  biography: string | null;
  languageCode: string;
  timeZoneId: string;
  roleId: number;
}

// --- Posts ---

export interface CreatePostData {
  authorPostId: string;
  type: number; // 0,1,2,3
  title: string;
  content: string | null;
  isWork: boolean;
  isLocal: boolean;
}

export interface ApiPost {
  postId: string;
  authorPostId: string;
  type: number;
  title: string | null;
  content: string | null;
  isWork: boolean;
  isLocal: boolean;
  isDeleted: boolean;
  postRepliedTo?: string | null;
  postRepostOf?: string | null;
  createdAt: string; // ISO
  updatedAt: string;
  author?: UserDto; // Si la API expande el autor
}

export interface ReplyData {
  replyToPostId: string;
  authorId: string;
  title: string;
  content: string;
}

export interface RepostData {
  authorId: string;
  originalPostId: string;
}

export interface LikeData {
  postId: string;
  userId: string;
}

export type UploadMediaType = Exclude<PostType, PostType.PLAIN>; // "image" | "music" | "text"

export interface UploadMediaData {
  File: File;
  Type: UploadMediaType; // ahora solo "image" | "music" | "text"
  Title: string;
  Description?: string;
  IsWorkMedia?: boolean;
  // Para imagen
  Width?: number;
  Height?: number;
  Format?: string;
  // Para música
  BitrateKbps?: number;
  DurationSec?: number;
  // Para texto
  WordCount?: number;
  SortTitle?: string;
  Subtitle?: string;
  LanguageCode?: string;
  // Comunes
  FileSize?: number;
  GenreIds?: string[];
}

export interface FeedPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorUsername: string;
  uploadedAt: string; // fecha ISO
  mediaPreviewUrl: string | null;
  mediaMimeType: string | null;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  replyCount: number;
  repostCount: number;
}

export interface MediaDto {
  id: string;
  fileName: string;
  mimeType: string;
  url: string;
  isWorkMedia: boolean;
  // otros campos opcionales si los hubiera
}

export interface PostDto {
  id: string;
  authorPostId: string; // ID del autor (string)
  authorName?: string;
  author?: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  title: string | null;
  content: string | null;
  isWork: boolean;
  isLocal: boolean;
  uploadCount: number;
  likesCount: number;
  uploadedAt: string; // ISO 8601
  media: MediaDto[];
  isLikedByCurrentUser: boolean;
  isRetweetedByCurrentUser: boolean;
  replies?: PostDto[];
}

export interface PaginatedReplies {
  mode: "flat" | "tree";
  flat: {
    items: ReplyDto[];
    page: number;
    pageSize: number;
    totalCount: number;
  };
  tree: any | null;
}