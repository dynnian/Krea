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

// --- Profile ---
export interface UserProfileResponse {
  id: string;
  username: string;
  email: string;
  displayName: string;
  biography: string | null;
  languageCode: string;
  timeZoneId: string;
  roleId: number;
  followersCount: number;
  followingCount: number;
  profilePictureUrl: string | null;
  bannerPictureUrl: string | null;
}

export interface PatchUserProfileRequest {
  displayName?: string | null;
  displayNameIsSet: boolean;

  biography?: string | null;
  biographyIsSet: boolean;

  languageCode?: string | null;
  languageCodeIsSet: boolean;

  timeZoneId?: string | null;
  timeZoneIdIsSet: boolean;

  profilePictureId?: string | null;
  profilePictureIdIsSet: boolean;

  bannerPictureId?: string | null;
  bannerPictureIdIsSet: boolean;
}

export interface UploadUserProfilePictureResponse {
  mediaId: string;
  fileName: string;
  mimeType: string;
  url: string;
  size: number;
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
  isWorkMedia?: boolean;
  coverMediaId?: string | null;
  coverUrl?: string | null;
  coverMimeType?: string | null;
}

export interface PostDto {
  id: string;
  authorPostId: string;
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
  uploadedAt: string;
  media: MediaDto[];
  isLikedByCurrentUser: boolean;
  isRetweetedByCurrentUser: boolean;
  isFavoritedByCurrentUser?: boolean;
  replies?: PostDto[];
  repostOfId?: string;         // ID del post original si es repost
  repostOf?: PostDto;          // Post original (solo si es repost)
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

export interface PublicUserProfile {
  id: string;
  username: string;
  displayName: string;
  biography: string | null;
  languageCode: string;
  timeZoneId: string;
}