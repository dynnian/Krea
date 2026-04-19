// deno-lint-ignore-file
import type { PostDto } from '../../types/api.ts';

interface PostLinkDetailProps {
  post: PostDto;
}

export default function PostLinkDetail({ post }: PostLinkDetailProps) {
  const firstMedia = post.media?.[0];
  const imageMedia = post.media?.find((m) => m.mimeType?.startsWith('image/'));

  const bookCoverUrl =
    firstMedia?.coverUrl ||
    (firstMedia as any)?.CoverUrl ||
    imageMedia?.url ||
    null;

  const documentUrl = firstMedia?.url;

  if (!documentUrl) return null;

  return (
    <div className="mb-2">
      <div className="flex gap-6 items-start">
        <div className="w-[150px] h-[220px] shrink-0 overflow-hidden rounded-[6px] shadow-[4px_4px_10px_rgba(0,0,0,0.18)] bg-[#D9D9D9]">
          <img
            src={bookCoverUrl || 'https://placehold.co/150x220'}
            alt={post.title || 'Cover'}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex justify-between items-start gap-4">
            <h2 className="text-[28px] md:text-[34px] leading-6 font-semibold text-[#1B1C1E]">
              {post.title || 'Titulo de la obra'}
            </h2>

            <span className="text-[18px] text-[#1B1C1E] whitespace-nowrap">
              Ficción, Sci-Fi, etc...
            </span>
          </div>

          {post.content && (
            <p className="text-[15px] md:text-[16px] leading-6 text-[#1B1C1E] text-justify mt-4 mb-6 max-w-[760px]">
              {post.content}
            </p>
          )}

          <div className="mt-auto">
            <a
              href={documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-[#0B5107] text-white text-[16px] hover:bg-[#083d05] transition"
            >
              Leer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}