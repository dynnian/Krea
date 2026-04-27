// deno-lint-ignore-file
import { useNavigate } from 'react-router';
import type { PostDto } from '../../types/api.ts';
import LiteratureCover from "../LiteratureCover.tsx";

interface PostLinkDetailProps {
  post: PostDto;
}

export default function PostLinkDetail({ post }: PostLinkDetailProps) {
  const navigate = useNavigate();
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
          <LiteratureCover
            title={post.title}
            coverUrl={bookCoverUrl}
            documentUrl={documentUrl}
            mimeType={firstMedia?.mimeType}
            width={150}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex justify-between items-start gap-4">
            <h2 className="text-[28px] md:text-[34px] leading-[32px] font-semibold text-[#1B1C1E]">
              {post.title || 'Titulo de la obra'}
            </h2>
          </div>
        
            <span className="text-[18px] text-[#1B1C1E] whitespace-nowrap">
              Ficción, Sci-Fi, etc...
            </span>

          {post.content && (
            <p className="text-[15px] md:text-[16px] leading-6 text-[#1B1C1E] text-justify mt-4 mb-6 max-w-[760px]">
              {post.content}
            </p>
          )}

          <div className="mt-auto">
            <button
              type="button"
              onClick={() => navigate(`/read/${post.id}`)}
              className="krea-save-button inline-flex items-center justify-center px-8 py-3 rounded-full bg-[#0B5107] text-white text-[16px] hover:bg-[#083d05] transition cursor-pointer"
            >
              Leer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}