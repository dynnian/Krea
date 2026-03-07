import { type Timestamp } from "./common.ts";
import { PostType, LikeTargetType } from "./common";
import { type User } from "./user.ts";
import { type Media } from "./media.ts";
import type { AuthUser } from "~/contexts/AuthContext.tsx";

export interface Post {
  id: string; // UUID
  user_post_id: string; // UUID del autor
  type: PostType | null;
  title: string | null;
  content: string | null;
  is_work: boolean;
  is_deleted: boolean;
  is_local: boolean;
  post_replied_to: string | null; // UUID del post padre (si es reply)
  post_repost_of: string | null; // UUID del post original (si es repost)
  created_at: Timestamp;
  updated_at: Timestamp;

  // Relaciones (opcional, según lo que devuelva la API)
  author?: AuthUser;
  replies?: Post[];
  repost?: Post;
  media?: PostUpload[];
  hashtags?: Hashtag[];
  likesCount?: number;
  repostsCount?: number; // o favoritesCount, según corresponda
}

export interface PostUpload {
  post_id: string;
  media_id: number; // media_id puede seguir siendo número (auto-incremental)
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
  id: string; // UUID
  user_id: string;
  target_id: string; // ID del post (UUID)
  target_type: LikeTargetType;
  liked_at: Timestamp;
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
  title: string;
  content: string;
}
interface LikeData {
  postId: string;   // UUID del post
  userId: string;   // UUID del usuario que da like
}
interface RepostData {
  authorId: string; // UUID del usuario que repostea
  originalPostId: string; // UUID del post original
}