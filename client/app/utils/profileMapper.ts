import type { MusicSong } from "../components/Profile/MusicPortfolio.tsx";
import type { WriterWork } from "../components/Profile/WriterPortfolio.tsx";
import type {
  ApiPost,
  Post,
  VisualPortfolioItem,
} from "../types/profile.ts";
import { PostType } from "../types/profile.ts";

export const isImageMime = (mime?: string) =>
  !!mime && mime.startsWith("image/");

export const isAudioMime = (mime?: string) =>
  !!mime && (mime.startsWith("audio/") || mime.startsWith("music/"));

export const isDocumentMime = (mime?: string) =>
  !!mime &&
  (
    mime === "application/pdf" ||
    mime === "application/epub+zip" ||
    mime === "text/plain"
  );

export function normalizeApiPosts(
  apiPosts: ApiPost[],
  displayName: string,
): Post[] {
  return apiPosts.map((post, index) => {
    const hasAudio = post.media.some((m) => isAudioMime(m.mimeType));
    const hasImage = post.media.some((m) => isImageMime(m.mimeType));
    const hasDocument = post.media.some((m) => isDocumentMime(m.mimeType));

    return {
      backendId: post.postId ?? post.id,
      id: Number.isFinite(Number(post.postId ?? post.id))
        ? Number(post.postId ?? post.id)
        : index + 1,
      userPostId: Number.isFinite(Number(post.postId ?? post.id))
        ? Number(post.postId ?? post.id)
        : index + 1,
        type: hasAudio
        ? PostType.AUDIO
        : hasDocument
            ? PostType.LINK
            : hasImage
            ? PostType.IMAGE
            : PostType.LINK,
      title: post.title,
      content: post.content,
      isWork: post.media.some((m) => m.isWorkMedia),
      isDeleted: false,
      isLocal: true,
      postRepliedTo: null,
      postRepostOf: null,
      createdAt: post.createdAt,
      updatedAt: post.createdAt,
      author: {
        id: post.userId,
        name: displayName,
        handle: post.authorUsername,
        avatar: undefined,
        isVerified: true,
      },
      media: post.media.map((m) => ({
        postId: Number.NaN,
        mediaId: m.id,
        isWorkMedia: m.isWorkMedia,
        media: {
          id: m.id,
          originalFileName: m.fileName,
          fileName: m.fileName,
          mimeType: m.mimeType,
          path: m.url,
          uploadedAt: post.createdAt,
          coverUrl: m.coverUrl,
          coverMediaId: m.coverMediaId,
        },
      })),
      likesCount: post.likesCount ?? 0,
      favoritesCount: post.favoritesCount ?? 0,
      replies: [],
      isLikedByCurrentUser: post.isLikedByCurrentUser ?? false,
    };
  });
}

export function mapPostsToVisualPortfolioItems(
  posts: Post[],
): VisualPortfolioItem[] {
  return posts
    .filter((post) => {
      const hasImage = post.media?.some((m) =>
        isImageMime(m.media?.mimeType)
      );
      return post.isWork && hasImage;
    })
    .map((post) => {
      const firstImage = post.media.find((m) =>
        isImageMime(m.media?.mimeType)
      );

      return {
        id: String(post.backendId ?? post.id),
        title: post.title ?? "Sin título",
        imageUrl: firstImage?.media.path ?? "",
      };
    })
    .filter((item) => item.imageUrl);
}

export function mapPostsToMusicSongs(posts: Post[]): MusicSong[] {
  return posts
    .filter((post) => {
      const hasAudio = post.media?.some((m) =>
        isAudioMime(m.media?.mimeType)
      );
      return post.isWork && post.type === PostType.AUDIO && hasAudio;
    })
    .map((post) => {
      const audioMedia = post.media.find((m) =>
        isAudioMime(m.media?.mimeType)
      );

      const coverMedia = post.media.find((m) =>
        isImageMime(m.media?.mimeType)
      );

      if (!audioMedia) return null;

      return {
        id: String(post.backendId ?? post.id),
        postId: String(post.backendId ?? post.id),
        title: post.title ?? "Sin título",
        genre: "Sin género",
        coverUrl:
          audioMedia?.media.coverUrl ??
          coverMedia?.media.path ??
          "https://placehold.co/240x240?text=Cover",
        audioUrl: audioMedia.media.path,
        likesCount: post.likesCount ?? 0,
        isLiked: post.isLikedByCurrentUser ?? false,
      };
    })
    .filter((song): song is MusicSong => song !== null);
}

export function mapPostsToWriterWorks(posts: Post[]): WriterWork[] {
  return posts
    .filter((post) => {
      const hasDocument = post.media?.some((m) =>
        isDocumentMime(m.media?.mimeType)
      );

      return post.isWork && post.type === PostType.LINK && hasDocument;
    })
    .map((post) => {
      const documentMedia = post.media.find((m) =>
        isDocumentMime(m.media?.mimeType)
      );

      const coverMedia = post.media.find((m) =>
        isImageMime(m.media?.mimeType)
      );

      return {
        id: String(post.backendId ?? post.id),
        postId: String(post.backendId ?? post.id),
        title: post.title ?? "Sin título",
        coverUrl:
          documentMedia?.media.coverUrl ??
          coverMedia?.media.path ??
          "https://placehold.co/240x360?text=Libro",
        chaptersCount: 1,
        genre: "Sin género",
        description: post.content ?? "",
        likesCount: post.likesCount ?? 0,
        isLiked: post.isLikedByCurrentUser ?? false,
        createdAt: post.createdAt,
      };
    });
}