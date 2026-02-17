import { type Timestamp } from "./common.ts";
import { PostType, LikeTargetType } from "./common";
import { type User } from "./user.ts";
import { type Media } from "./media.ts";
import type { AuthUser } from "~/contexts/AuthContext.tsx";

export interface Post {
  id: number;
  user_post_id: number; // FK a user
  type: PostType | null;
  title: string | null;
  content: string | null;
  is_work: boolean;
  is_deleted: boolean;
  is_local: boolean;
  post_replied_to: number | null; // FK a post
  post_repost_of: number | null; // FK a post
  created_at: Timestamp;
  updated_at: Timestamp;

  // Relaciones (opcional, según expanda la API)
  author?: AuthUser;
  replies?: Post[];
  repost?: Post;
  media?: PostUpload[];
  hashtags?: Hashtag[];
  likesCount?: number;
  favoritesCount?: number;
}

export interface PostUpload {
  post_id: number;
  media_id: number;
  is_work_media: boolean;

  media?: Media;
}

export interface PostFavorite {
  user_id: number;
  post_id: number;
  favorited_at: Timestamp;

  user?: User;
  post?: Post;
}

export interface Like {
  id: number;
  user_id: number;
  target_id: number; // ID de la entidad likeable
  target_type: LikeTargetType;
  liked_at: Timestamp;

  user?: User;
  // target puede ser Post, etc.
}

export interface Hashtag {
  id: number;
  name: string;
}

export interface PostHashtag {
  post_id: number;
  tag_id: number;

  hashtag?: Hashtag;
  post?: Post;
}
export interface ComposerForm {
  content: string;
}
