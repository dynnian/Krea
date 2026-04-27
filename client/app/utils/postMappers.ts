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
  (import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "/api").replace(/\/api\/?$/, "");

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
      avatar: normalizeAssetUrl(
        (feedPost as any).authorProfilePictureUrl ??
          (feedPost as any).AuthorProfilePictureUrl ??
          (feedPost as any).profilePictureUrl ??
          (feedPost as any).ProfilePictureUrl ??
          (feedPost as any).avatarUrl ??
          (feedPost as any).AvatarUrl
      ),
      sub: feedPost.authorId,
      email: "",
    } as any,
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
    genres:
      (item as any).genres ??
      (item as any).Genres ??
      (item as any).genreNames ??
      (item as any).GenreNames ??
      [],
  }] : [];

  const repostMedia = item.repostOf?.mediaPreviewUrl ? [{
    id: "",
    fileName: item.repostOf.mediaPreviewUrl.split("/").pop() || "",
    mimeType: item.repostOf.mediaMimeType || "",
    url: item.repostOf.mediaPreviewUrl,
    isWorkMedia: false,
    coverMediaId: item.repostOf.coverMediaId ?? null,
    coverUrl: item.repostOf.coverUrl ?? null,
    coverMimeType: item.repostOf.coverMimeType ?? null,
  }] : [];

  const repostOf = item.repostOf ? {
    id: item.repostOf.id,
    authorPostId: item.repostOf.authorId,
    authorName: item.repostOf.authorUsername,
    author: {
      id: item.repostOf.authorId,
      username: item.repostOf.authorUsername,
      displayName: item.repostOf.authorUsername,
      avatar: normalizeAssetUrl(
        item.repostOf.authorProfilePictureUrl ?? null
      ),
    },
    title: item.repostOf.title,
    content: item.repostOf.content,
    isWork: false,
    isLocal: false,
    uploadCount: repostMedia.length,
    likesCount: item.repostOf.likeCount ?? 0,
    repostCount: item.repostOf.repostCount ?? 0,
    uploadedAt: item.repostOf.uploadedAt,
    media: repostMedia,
    isLikedByCurrentUser: false,
    isRetweetedByCurrentUser: item.isRetweetedByCurrentUser,
    isFavoritedByCurrentUser: item.isFavorite ?? false,
    replies: [],
  } satisfies PostDto : undefined;

  return {
    id: item.id,
    authorPostId: item.authorId,                 // ← usar authorId
    authorName: item.authorUsername,             // ← añadir authorName
    author: {
      id: item.authorId,
      username: item.authorUsername,
      displayName: item.authorUsername,
      genres:
        (item as any).genres ??
        (item as any).Genres ??
        (item as any).genreNames ??
        (item as any).GenreNames ??
        (item as any).post?.genres ??
        (item as any).post?.Genres ??
        (item as any).post?.genreNames ??
        (item as any).post?.GenreNames ??
        [],
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
    repostCount: item.repostCount,
    uploadedAt: item.uploadedAt,
    media,
    isLikedByCurrentUser: item.isLikedByCurrentUser,
    isRetweetedByCurrentUser: item.isRetweetedByCurrentUser,
    isFavoritedByCurrentUser: item.isFavorite ?? false, // ← para bookmark
    repliedToId: item.repliedToId ?? null,
    repostOfId: item.repostOfId ?? undefined,
    repostOf,
    replies: [],
  };
}