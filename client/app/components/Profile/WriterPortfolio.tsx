import React, { useEffect, useRef, useState } from "react";
import { Bookmark, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { useAuth } from "../../contexts/AuthContext.tsx";
import { postsApi } from "../../services/postsService.ts";

export type WriterWork = {
  id: string;
  postId: string;
  title: string;
  coverUrl: string;
  chaptersCount: number;
  genre: string;
  description: string;
  likesCount: number;
  isLiked: boolean;
};

const WriterCard: React.FC<{ work: WriterWork }> = ({ work }) => {
  const navigate = useNavigate();
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);
  const [showReadMore, setShowReadMore] = useState(false);

  const openPostDetail = () => {
    navigate(`/post/${work.postId}`);
  };
useEffect(() => {
  const el = descriptionRef.current;
  if (!el) return;

  const isOverflowing = el.scrollHeight > el.clientHeight;
  setShowReadMore(isOverflowing);
}, [work.description]);

	return (
		<div className="w-[687px] h-[170px] bg-[#E8F1FC] border border-[#8F8E8A] p-[15px]">
			<div className="flex h-full gap-[22px] items-center">
        <div className="h-full aspect-[2/3] shrink-0 overflow-hidden shadow-[4px_4px_4px_rgba(0,0,0,0.15)]">
          <img
            src={work.coverUrl}
            alt={work.title}
            onClick={openPostDetail}
            className="w-full h-full object-cover cursor-pointer"
          />
				</div>

				<div className=" h-full flex flex-col min-w-0 pb-[4px] pt-[5px] gap-[0px]">
					<div className="flex items-start justify-between gap-[0px]">
            <div className="min-w-0 flex flex-col gap-[0px]">
              <div className="h-full">
                <h3 
                className="text-[20px] leading-[20px] font-bold text-[#1B1C1E] cursor-pointer hover:underline"
                onClick={openPostDetail}
                >
                  {work.title}
                </h3>
              </div>
              
              <div className="-mt-[5px]">
                <p className=" text-[13px] leading-[13px] font-medium text-[#1B1C1E]">
                  {work.chaptersCount} Capítulos
                </p>
              </div>
            </div>

						<span className="pt-[2px] text-[12px] font-medium text-[#1B1C1E] whitespace-nowrap">
							{work.genre}
						</span>
					</div>

					<div className="mt-[0px] h-auto min-w-0">
            <div className="mt-[px] min-w-0">
              <p
                ref={descriptionRef}
                className="text-[11px] leading-[16px] text-justify font-medium text-[#1B1C1E] line-clamp-3 overflow-hidden"
              >
                {work.description}
              {showReadMore && (
                <button
                  type="button"
                  className="inline text-[11px] leading-[14px] font-medium text-[#0B5107] underline underline-offset-2"
                >
                  Leer más...
                </button>
              )}
              </p>
            </div>
          </div>
					<div className="mt-auto pt-[0px] flex items-center gap-3">
						<button
							type="button"
							className="px-[33px] py-[1px] cursor-pointer hover:bg-[#093B05] rounded-full bg-[#0B5107] border border-[#1B1C1E]"
						>
							<span className="text-[11px] font-medium leading-5 text-[#E3E2DE]">
								Leer
							</span>
						</button>

						<button
							type="button"
							className="w-[24px] h-[24px] rounded-full border border-[#0B5107] bg-[#E9FDE8] text-[#0B5107] flex items-center justify-center"
						>
							<Bookmark size={14} />
						</button>

						<button
							type="button"
							className="w-[24px] h-[24px] rounded-full border border-[#0B5107] bg-[#E9FDE8] text-[#0B5107] flex items-center justify-center"
						>
				    		<Heart size={14} />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

type WriterPortfolioProps = {
  works?: WriterWork[];
  error?: string | null;
};

export default function WriterPortfolio({
  works = [],
  error = null,
}: WriterPortfolioProps) {
  const leftColumn = works.filter((_, index) => index % 2 === 0);
  const rightColumn = works.filter((_, index) => index % 2 !== 0);

  return (
    <div className="w-full max-w-[1388px] mx-auto">
      {works.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[14px]">
          <div className="flex flex-col gap-[14px]">
            {leftColumn.map((work) => (
              <WriterCard key={work.id} work={work} />
            ))}
          </div>

          <div className="flex flex-col gap-[14px]">
            {rightColumn.map((work) => (
              <WriterCard key={work.id} work={work} />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No hay obras literarias disponibles.
        </div>
      )}
    </div>
  );
}
