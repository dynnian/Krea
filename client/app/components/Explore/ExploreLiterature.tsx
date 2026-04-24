// components/Explore/ExploreLiterature.tsx
import React, { useEffect, useState } from "react";
import { Spin, message } from "antd";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { postsApi } from "../../services/postsService";
import type { ExplorePostDto } from "../../types/api";

interface ExploreLiteratureProps {
  selectedTag?: string | null;
}

export default function ExploreLiterature({ selectedTag }: ExploreLiteratureProps) {
  const [books, setBooks] = useState<ExplorePostDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const tags = selectedTag ? [selectedTag] : undefined;
        const res = await postsApi.explore({ category: "Text", tags, pageSize: 20 });
        setBooks(res.data.items || []);
      } catch (error) {
        console.error(error);
        message.error("Error loading literature");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [selectedTag]);

  if (loading) return <div className="flex justify-center p-20"><Spin size="large" /></div>;

  const featuredBook = books[0];
  const restBooks = books.slice(1);

  return (
    <div className="max-w-[1129px] mx-auto pt-6 pb-20">
      {featuredBook && (
        <div className="mb-12">
          <h2 className="text-[36px] font-bold mb-4">Destacado</h2>
          <div className="bg-[#E8F1FC] border border-[#8F8E8A] p-6 rounded-[10px] flex gap-6">
            <div className="w-32 h-44 bg-white shrink-0 shadow-sm flex items-center justify-center border border-gray-200">
              {featuredBook.coverUrl ? (
                <img src={featuredBook.coverUrl} className="w-full h-full object-cover" alt="cover" />
              ) : featuredBook.previewUrl ? (
                <img src={featuredBook.previewUrl} className="w-full h-full object-cover" alt="cover" />
              ) : (
                <BookOpen size={40} className="text-gray-300" />
              )}
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <Link to={`/post/${featuredBook.id}`} className="text-xl font-bold text-[#1B1C1E] hover:underline">
                  {featuredBook.title}
                </Link>
                <Link to={`/user/${featuredBook.userId}`} className="text-sm text-[#464749] mb-2 block hover:underline">
                  @{featuredBook.authorUsername}
                </Link>
                <div className="flex flex-wrap gap-1 mb-3">
                  {featuredBook.genres.map((g) => (
                    <span key={g} className="text-[10px] bg-white border px-2 py-0.5 rounded text-gray-500 uppercase">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
              <Link to={`/post/${featuredBook.id}`} className="text-[#1351AA] text-sm font-bold w-fit hover:underline">
                Leer ahora
              </Link>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-[36px] font-bold mb-8">Explorar literatura</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {restBooks.map((book) => (
          <div key={book.id} className="bg-[#E8F1FC] border border-[#8F8E8A] p-6 rounded-[10px] flex gap-6 hover:shadow-md">
            <div className="w-32 h-44 bg-white shrink-0 shadow-sm flex items-center justify-center border border-gray-200">
              {book.coverUrl ? (
                <img src={book.coverUrl} className="w-full h-full object-cover" alt="cover" />
              ) : book.previewUrl ? (
                <img src={book.previewUrl} className="w-full h-full object-cover" alt="cover" />
              ) : (
                <BookOpen size={40} className="text-gray-300" />
              )}
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <Link to={`/post/${book.id}`} className="text-xl font-bold text-[#1B1C1E] hover:underline">
                  {book.title}
                </Link>
                <Link to={`/user/${book.userId}`} className="text-sm text-[#464749] mb-2 block hover:underline">
                  @{book.authorUsername}
                </Link>
                <div className="flex flex-wrap gap-1 mb-3">
                  {book.genres.map((g) => (
                    <span key={g} className="text-[10px] bg-white border px-2 py-0.5 rounded text-gray-500 uppercase">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
              <Link to={`/post/${book.id}`} className="text-[#1351AA] text-sm font-bold w-fit hover:underline">
                Leer más
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}