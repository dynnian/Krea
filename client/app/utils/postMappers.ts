// deno-lint-ignore-file
import {
  type ApiPost,
  type UserDto,
  type CreatePostData,
  type FeedPost,
  type PostDto,
} from "../types/api.ts";
import { type Post } from "../types/post.ts";
import { type AuthUser } from "../contexts/AuthContext.tsx";
import { PostType } from "../types/common.ts";
import type { FeedItem } from "../types/feed.ts";
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5101/api").replace(
    /\/api\/?$/,
    ""
  );

const normalizeAssetUrl = (url?: string | null) => {
  if (!url) return undefined;

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};
// Mapeo de números a enum PostType
export function postTypeFromApi(apiType: number): PostType {
  const map: { [key: number]: PostType } = {
    0: PostType.PLAIN,
    1: PostType.TEXT,
    2: PostType.IMAGE,
    3: PostType.MUSIC,
  };
  return map[apiType];
}

// Mapeo de enum a número para enviar a la API
export function postTypeToApi(type: PostType): number {
  const map: Record<PostType, number> = {
    [PostType.PLAIN]: 0,
    [PostType.TEXT]: 1,
    [PostType.IMAGE]: 2,
    [PostType.MUSIC]: 3,
  };
  return map[type];
}

// Mapear UserDto a AuthUser (parcial)
function mapUserDto(dto: UserDto): AuthUser {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.displayName,
    handle: dto.username,
    biography: dto.biography,
    languageCode: dto.languageCode,
    timeZoneId: dto.timeZoneId,
    // role: mapear roleId a string si es necesario
  };
}

export function apiPostToPost(apiPost: ApiPost): Post {
  return {
    id: apiPost.postId,
    user_post_id: apiPost.authorPostId,
    type: postTypeFromApi(apiPost.type),
    title: apiPost.title,
    content: apiPost.content,
    is_work: apiPost.isWork,
    is_local: apiPost.isLocal,
    is_deleted: apiPost.isDeleted,
    post_replied_to: apiPost.postRepliedTo || null,
    post_repost_of: apiPost.postRepostOf || null,
    created_at: apiPost.createdAt,
    updated_at: apiPost.updatedAt,
    author: apiPost.author ? mapUserDto(apiPost.author) : undefined,
    // likesCount, repostsCount no vienen de la API; se gestionarán localmente
  };
}

export function postToApiCreate(post: {
  authorPostId: string;
  type: PostType;
  title: string;
  content: string | null;
  isWork: boolean;
  isLocal: boolean;
}): CreatePostData {
  return {
    authorPostId: post.authorPostId,
    type: postTypeToApi(post.type),
    title: post.title,
    content: post.content,
    isWork: post.isWork,
    isLocal: post.isLocal,
  };
}
export function feedPostToPost(feedPost: FeedPost): Post {
  // Inferir tipo según mime type
  let type = PostType.TEXT;
  if (feedPost.mediaMimeType) {
    if (feedPost.mediaMimeType.startsWith("image/")) {
      type = PostType.IMAGE;
    } else if (feedPost.mediaMimeType.startsWith("audio/")) {
      type = PostType.MUSIC;
    }
  }

  // Construir media con URL completa
  const media =
    feedPost.mediaPreviewUrl && feedPost.mediaMimeType
      ? [
          {
            post_id: feedPost.id,
            media_id: 0,
            is_work_media: false,
            media: {
              id: 0,
              filename: "",
              mime_type: feedPost.mediaMimeType,
              // Si ya es una URL absoluta, la dejamos; si no, agregamos el base
              path: feedPost.mediaPreviewUrl.startsWith("http")
                ? feedPost.mediaPreviewUrl
                : `${API_BASE_URL}${feedPost.mediaPreviewUrl}`,
              file_size: 0,
              uploaded_at: feedPost.uploadedAt,
            },
          },
        ]
      : [];

  return {
    id: feedPost.id,
    user_post_id: feedPost.authorId,
    type: type,
    title: feedPost.title,
    content: feedPost.content,
    is_work: false,
    is_deleted: false,
    is_local: false,
    post_replied_to: null,
    post_repost_of: null,
    created_at: feedPost.uploadedAt,
    updated_at: feedPost.uploadedAt,
    author: {
      id: feedPost.authorId,
      name: feedPost.authorUsername,
      handle: feedPost.authorUsername,
      avatar: undefined,
      sub: feedPost.authorId,
      email: "",
    },
    media: media,
    likesCount: feedPost.likeCount,
    favoritesCount: feedPost.repostCount,
  };
}
// utils/postMappers.ts
export function feedItemToPostDto(item: FeedItem): PostDto {
  const media = item.mediaPreviewUrl ? [{
    id: "",
    fileName: item.mediaPreviewUrl.split("/").pop() || "",
    mimeType: item.mediaMimeType || "",
    url: item.mediaPreviewUrl,
    isWorkMedia: false,
    coverMediaId: item.coverMediaId ?? null,
    coverUrl: item.coverUrl ?? null,
    coverMimeType: item.coverMimeType ?? null,
  }] : [];

  return {
    id: item.id,
    authorPostId: item.authorId,                 // ← usar authorId
    authorName: item.authorUsername,             // ← añadir authorName
    author: {
      id: item.authorId,
      username: item.authorUsername,
      displayName: item.authorUsername,
      avatar: normalizeAssetUrl(
        (item as any).authorProfilePictureUrl ??
          (item as any).AuthorProfilePictureUrl ??
          (item as any).profilePictureUrl ??
          (item as any).ProfilePictureUrl ??
          (item as any).avatarUrl ??
          (item as any).AvatarUrl
      ),
    },
    title: item.title,
    content: item.content,
    isWork: false,
    isLocal: false,
    uploadCount: media.length,
    likesCount: item.likeCount,
    uploadedAt: item.uploadedAt,
    media,
    isLikedByCurrentUser: item.isLikedByCurrentUser,
    isRetweetedByCurrentUser: false,
    isFavoritedByCurrentUser: item.isFavorite ?? false, // ← para bookmark
    replies: [],
  };
}