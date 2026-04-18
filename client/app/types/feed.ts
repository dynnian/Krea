// types/api.ts
export interface FeedItem {
  id: string;
  title: string | null;
  content: string | null;
  authorId: string;
  authorUsername: string;
  authorProfilePictureUrl: string | null;
  uploadedAt: string;
  mediaPreviewUrl: string | null;
  mediaMimeType: string | null;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  replyCount: number;
  repostCount: number;
  isFavorite: boolean;
}
