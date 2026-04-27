// deno-lint-ignore-file
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
  apiPosts: any[],
  displayName: string,
): Post[] {
  return apiPosts.map((post, index) => {
    const media = post.media ?? post.Media ?? [];
    const hasAudio = media.some((m: any) => isAudioMime(m.mimeType ?? m.MimeType));
    const hasImage = media.some((m: any) => isImageMime(m.mimeType ?? m.MimeType));
    const hasDocument = media.some((m: any) => isDocumentMime(m.mimeType ?? m.MimeType));

    const backendId = post.id ?? post.Id ?? String(index + 1);
    const uploadedAt =
      post.uploadedAt ??
      post.UploadedAt ??
      post.createdAt ??
      post.CreatedAt ??
      new Date().toISOString();

      const postGenres =
        post.genres ??
        post.Genres ??
        post.genreNames ??
        post.GenreNames ??
        [];

    const likesCount = post.likesCount ?? post.LikesCount ?? 0;
    const isLikedByCurrentUser =
      post.isLikedByCurrentUser ?? post.IsLikedByCurrentUser ?? false;
    const favoritesCount = post.favoritesCount ?? post.FavoritesCount ?? 0;
    const isFavorite =
      post.isFavorite ??
      post.IsFavorite ??
      post.isFavoritedByCurrentUser ??
      post.IsFavoritedByCurrentUser ??
      false;
    return {
      backendId,
      id: Number.isFinite(Number(backendId)) ? Number(backendId) : index + 1,
      userPostId:
        post.uploadCount ??
        post.UploadCount ??
        post.authorPostId ??
        post.AuthorPostId ??
        index + 1,
        type: hasAudio
          ? PostType.AUDIO
          : hasDocument
            ? PostType.LINK
            : hasImage
              ? PostType.IMAGE
              : PostType.LINK,
        genres: postGenres,
        title: post.title ?? post.Title ?? null,
      content: post.content ?? post.Content ?? "",
      isWork:
        post.isWork ??
        post.IsWork ??
        media.some((m: any) => m.isWorkMedia ?? m.IsWorkMedia) ??
        false,
      isDeleted: false,
      isLocal: post.isLocal ?? post.IsLocal ?? true,
      postRepliedTo: post.postRepliedTo ?? post.PostRepliedTo ?? null,
      postRepostOf: post.postRepostOf ?? post.PostRepostOf ?? null,
      createdAt: uploadedAt,
      updatedAt: post.updatedAt ?? post.UpdatedAt ?? uploadedAt,
      author: {
        id:
          post.author?.id ??
          post.Author?.Id ??
          post.userId ??
          post.UserId ??
          backendId,
        name:
          post.author?.displayName ??
          post.Author?.DisplayName ??
          post.authorName ??
          post.AuthorName ??
          displayName,
        handle:
          post.author?.username ??
          post.Author?.Username ??
          post.authorUsername ??
          post.AuthorUsername ??
          displayName,
        avatar:
          post.author?.avatar ??
          post.Author?.Avatar ??
          post.author?.profilePictureUrl ??
          post.Author?.ProfilePictureUrl,
        isVerified: true,
      },
      media: media.map((m: any) => ({
        postId: Number.isFinite(Number(backendId)) ? Number(backendId) : Number.NaN,
        mediaId: m.id ?? m.Id,
        isWorkMedia: m.isWorkMedia ?? m.IsWorkMedia ?? false,
        media: {
          id: m.id ?? m.Id,
          originalFileName: m.fileName ?? m.FileName,
          fileName: m.fileName ?? m.FileName,
          mimeType: m.mimeType ?? m.MimeType,
          path: m.url ?? m.Url,
          uploadedAt,
          coverUrl: m.coverUrl ?? m.CoverUrl,
          coverMediaId: m.coverMediaId ?? m.CoverMediaId,
          genres: m.genres ?? m.Genres ?? [],
        },
      })),
      likesCount,
      favoritesCount,
      replies: post.replies ?? post.Replies ?? [],
      isLikedByCurrentUser,
      isFavorite,
      isFavoritedByCurrentUser: isFavorite,
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

      const genres =
        audioMedia?.media.genres?.length
          ? audioMedia.media.genres
          : post.genres ?? [];

      if (!audioMedia) return null;

      return {
        id: String(post.backendId ?? post.id),
        postId: String(post.backendId ?? post.id),
        title: post.title ?? "Sin título",
        genre: genres.length ? genres.join(", ") : "Sin género",
        coverUrl:
          audioMedia?.media.coverUrl ??
          coverMedia?.media.path ??
          "https://placehold.co/240x240?text=Cover",
        audioUrl: audioMedia.media.path,
        likesCount: post.likesCount ?? 0,
        isLiked: post.isLikedByCurrentUser ?? false,
        isBookmarked:
          post.isFavoritedByCurrentUser ??
          post.isFavorite ??
          false,
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

      const genres =
        documentMedia?.media.genres?.length
          ? documentMedia.media.genres
          : post.genres ?? [];

      return {
        id: String(post.backendId ?? post.id),
        postId: String(post.backendId ?? post.id),
        title: post.title ?? "Sin título",

        coverUrl:
          documentMedia?.media.coverUrl ??
          coverMedia?.media.path ??
          null,

        documentUrl:
          documentMedia?.media.path ??
          null,

        mimeType:
          documentMedia?.media.mimeType ??
          null,


        chaptersCount: 1,
        genre: genres.length ? genres.join(", ") : "Sin género",
        description: post.content ?? "",
        likesCount: post.likesCount ?? 0,
        isLiked: post.isLikedByCurrentUser ?? false,
        createdAt: post.createdAt,
        isBookmarked:
          post.isFavoritedByCurrentUser ??
          post.isFavorite ??
          false,
      };
    });
}