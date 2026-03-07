import { type ApiPost, type UserDto, type CreatePostData } from "../types/api";
import { type Post } from "../types/post";
import { type AuthUser } from "../contexts/AuthContext";
import { PostType } from "../types/common";


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
    id: apiPost.id,
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
