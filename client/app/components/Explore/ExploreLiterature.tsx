import React from "react";
import { Heart, Bookmark, BookOpen } from "lucide-react";
import {
  featuredBookMock,
  trendingBooksMock,
  recentBooksMock,
  trendingLiteratureGenresMock,
  trendingAuthorsMock,
} from "../../data/exploreLiteratureMock.ts";

interface ExploreLiteratureProps {
  selectedTag?: string | null;
  selectedArtist?: string | null;
}

export default function ExploreLiterature({
  selectedTag,
  selectedArtist,
}: ExploreLiteratureProps) {
  return (
    <div className="w-full pt-0 pb-[20px]">
      {/* Featured section */}
      <section className="w-full h-[350px] bg-[#E8F1FC] border border-[#8F8E8A] px-[94px] pt-[18px] pb-[25px] flex flex-col">
        <div className="shrink-0 pb-[5px]">
          <h2>
            <span className="text-[#1B1C1E] text-[36px] font-bold">
              Destacado
            </span>
          </h2>
        </div>

        <div className="flex-1 min-h-0 flex flex-row gap-6 items-stretch">
          <img
            src={featuredBookMock.coverUrl}
            alt={featuredBookMock.title}
            className="h-full aspect-[2/3] object-cover shadow-[4px_4px_4px_rgba(0,0,0,0.15)]"
          />

          <div className="flex-1 min-w-0 h-full flex flex-col pt-[20px]">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-[3px]">
                  <span className="text-[#1B1C1E] hover:underline cursor-pointer text-[24px] font-semibold leading-none mb-[8px]">
                    {featuredBookMock.title}
                  </span>
                <div className="flex flex-row gap-[23px]">
                  <span className="text-[#6B6B6B hover:underline cursor-pointer text-[18px] leading-none mb-[10px]">
                    {featuredBookMock.author} ⋅ @{featuredBookMock.handle}
                  </span>

                    <button className="h-[24px] px-[22px] rounded-full border border-[#1B1C1E] bg-[#E8F1FC] hover:bg-[#BFD1EA] cursor-pointer">
                      <span className="text-[#1B1C1E] text-[11px] font-medium leading-none">
                        Seguir
                      </span>
                    </button>
                </div> 
                </div>

                <div className="flex flex-row gap-2 self-start">
                  {featuredBookMock.genres.map((genre) => (
                    <span
                      key={genre}
                      className="inline-flex items-center justify-center h-[26px] px-4 rounded-full border border-[#464749] text-[#464749] text-[11px] font-medium bg-[#E8F1FC]"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-[15px] flex flex-col">
                <span className="text-[#1B1C1E] text-[16px] font-bold leading-none mb-[8px]">
                  Sinopsis
                </span>

                <p className="text-[#1B1C1E]  text-[13px] leading-[20px] text-justify ">
                  {featuredBookMock.synopsis}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-[10px]">
              <button className="h-[44px] px-[30px] cursor-pointer hover:bg-[#093B05] rounded-full bg-[#0B5107] border border-[#1B1C1E]">
                <span className="text-[#E3E2DE] text-[14px] font-medium leading-none">
                  Leer ahora
                </span>
              </button>

              <button className="w-11 h-11 rounded-full border cursor-pointer border-[#0B5107] bg-[#E9FDE8] text-[#0B5107] flex items-center justify-center">
                <Bookmark size={20} />
              </button>

              <button className="w-11 h-11 rounded-full border cursor-pointer border-[#0B5107] bg-[#E9FDE8] text-[#0B5107] flex items-center justify-center">
                <Heart size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main content container */}
      <div className="mt-6 flex flex-col lg:flex-row gap-6">
        {/* Left column */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-8">
            {/* Trending books */}
            <section>
              <div className="pb-[10px]">
                <h3>
                  <span className="text-[#1B1C1E] text-[24px] font-bold">
                    En tendencia
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-5">
                {trendingBooksMock.map((book) => (
                  <div key={book.id} className="min-w-0">
                    <div className="aspect-[2/3] cursor-pointer overflow-hidden shadow-[4px_4px_4px_rgba(0,0,0,0.15)] mb-2">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[#1B1C1E] mx-[4px] cursor-pointer hover:underline text-[18px] font-semibold leading-tight truncate">
                        {book.title}
                      </span>
                      <span className="text-[#6B6B6B] mx-[4px] cursor-pointer hover:underline text-[14px] leading-tight truncate">
                        {book.author}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent books */}
            <section>
              <div className="pb-[10px]">
                <h3>
                  <span className="text-[#1B1C1E] text-[24px] font-bold">
                    Recientemente publicado
                  </span>
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                {recentBooksMock.map((book) => (
                  <div
                    key={book.id}
                    className="w-full h-[185px] bg-[#E8F1FC] border border-[#8F8E8A] p-[15px]"
                  >
                    <div className="flex h-full gap-[22px] items-center">
                      <div className="h-full aspect-[2/3] shrink-0 overflow-hidden shadow-[4px_4px_4px_rgba(0,0,0,0.15)]">
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="h-[full] flex flex-col min-w-0 flex-1 ">
                        <div className="flex items-start justify-between gap-[0px]">
                          <div className="min-w-0 flex flex-col gap-[0px]">
                            <div className="h-full">
                              <span className="text-[20px] cursor-pointer hover:underline leading-[20px] font-bold text-[#1B1C1E]">
                                {book.title}
                              </span>
                            </div>

                            <div className="mt-[2px]">
                              <span className="text-[13px] cursor-pointer hover:underline leading-[13px] font-medium text-[#1B1C1E]">
                                {book.author} ⋅ @{book.handle}
                              </span>
                            </div>
                          </div>

                          <span className="pt-[2px] text-[12px] font-medium text-[#1B1C1E] whitespace-nowrap">
                            {book.genre}
                          </span>
                        </div>

                        <div className="mt-[5px] h-auto min-w-0">
                          <span className="text-[11px] text-justify font-medium text-[#1B1C1E] line-clamp-3 overflow-hidden">
                            {book.description}
                          </span>
                        </div>

                        <div className="mb-[6px] ml-[5px]">
                          <span className="text-[11px] font-medium text-[#1B1C1E]">
                            {book.chaptersCount} Capítulos
                          </span>
                        </div>

                        <div className="mt-auto pt-[10px] flex items-center gap-3">
                          <button
                            type="button"
                            className="px-[33px] py-[1px] rounded-full bg-[#0B5107] border border-[#1B1C1E]"
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
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="w-full lg:w-[265px] shrink-0">
          <div className="flex flex-col gap-6 pt-[46px]">
            <section className="bg-[#E8F1FC] border border-[#8F8E8A] rounded-[10px] px-5 py-4">
              <h4>
                <span className="text-[#1B1C1E] text-[20px] font-bold leading-none mb-4">
                  Generos en tendencia
                </span>
              </h4>

              <div className="flex flex-wrap gap-2">
                {trendingLiteratureGenresMock.map((genre) => (
                  <span
                    key={genre}
                    className="inline-flex items-center justify-center h-[26px] px-4 rounded-full border border-[#464749] text-[#464749] text-[11px] font-medium bg-[#E8F1FC]"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </section>

            <section className="bg-[#E8F1FC] border border-[#8F8E8A] rounded-[10px] px-5 py-4">
              <h4>
                <span className="text-[#1B1C1E] text-[20px] font-bold leading-none mb-4">
                  Autores en tendencia
                </span>
              </h4>

              <div className="flex flex-wrap gap-2">
                {trendingAuthorsMock.map((author) => (
                  <span
                    key={author}
                    className="inline-flex items-center justify-center h-[26px] px-4 rounded-full border border-[#464749] text-[#464749] text-[11px] font-medium bg-[#E8F1FC]"
                  >
                    {author}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}