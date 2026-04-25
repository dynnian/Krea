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
  replyCount: number;
  repostCount: number;
  isFavorite: boolean;
  coverMediaId?: string | null;
  coverUrl?: string | null;
  coverMimeType?: string | null;
}
