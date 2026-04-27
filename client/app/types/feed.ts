// types/api.ts
export interface FeedItem {
  id: string;
  title: string | null;
  content: string | null;
  authorId: string;
  authorUsername: string;
  authorProfilePictureUrl?: string | null;
  profilePictureUrl?: string | null;
  uploadedAt: string;
  mediaPreviewUrl: string | null;
  mediaMimeType: string | null;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  isRetweetedByCurrentUser: boolean;
  replyCount: number;
  repostCount: number;
  isFavorite: boolean;
  coverMediaId?: string | null;
  coverUrl?: string | null;
  coverMimeType?: string | null;
  repliedToId?: string | null;
  repostOfId?: string | null;
  repostOf?: {
    id: string;
    title: string | null;
    content: string | null;
    authorId: string;
    authorUsername: string;
    authorProfilePictureUrl?: string | null;
    uploadedAt: string;
    mediaPreviewUrl?: string | null;
    mediaMimeType?: string | null;
    coverMediaId?: string | null;
    coverUrl?: string | null;
    coverMimeType?: string | null;
    likeCount?: number;
    replyCount?: number;
    repostCount?: number;
  } | null;
}
