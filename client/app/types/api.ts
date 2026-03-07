// app/types/api.ts

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
  id: string;
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

// --- Subida de medios ---
export interface UploadMediaData {
  File: File;
  BitrateKbps?: number;
  DurationSec?: number;
  Description?: string;
  FileSize?: number;
  Format?: string;
  GenreIds?: string[];
  Height?: number;
  IsWorkMedia?: boolean;
  LanguageCode?: string;
  SortTitle?: string;
  Subtitle?: string;
  // ... otros campos según el tipo de medio
}
