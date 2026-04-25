// deno-lint-ignore-file
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Spin, message } from "antd";
import { ChevronLeft } from "lucide-react";
import { postsApi } from "../../services/postsService.ts";
import EpubReader from "./EpubReader.tsx";
import PdfReader from "./PdfReader.tsx";

const API_ASSET_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5101/api").replace(
    /\/api\/?$/,
    ""
  );

const normalizeAssetUrl = (url?: string | null) => {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  return `${API_ASSET_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

const isPdf = (mimeType?: string | null) =>
  mimeType === "application/pdf";

const isEpub = (mimeType?: string | null) =>
  mimeType === "application/epub+zip" ||
  mimeType === "application/x-epub+zip";

export default function LiteratureReader() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) {
      setLoading(false);
      return;
    }

    const loadPost = async () => {
      try {
        setLoading(true);
        const response = await postsApi.getPost(postId);
        setPost(response.data ?? response);
      } catch (error) {
        console.error("Error loading reader post:", error);
        message.error("No se pudo cargar la obra.");
      } finally {
        setLoading(false);
      }
    };

    void loadPost();
  }, [postId]);

  const documentMedia = useMemo(() => {
    const media = post?.media ?? post?.Media ?? [];

    return media.find((item: any) => {
      const mimeType = item.mimeType ?? item.MimeType;
      return isPdf(mimeType) || isEpub(mimeType);
    });
  }, [post]);

  const title = post?.title ?? post?.Title ?? "Lector";
  const mimeType = documentMedia?.mimeType ?? documentMedia?.MimeType;
  const documentUrl = normalizeAssetUrl(
    documentMedia?.url ?? documentMedia?.Url ?? documentMedia?.path ?? documentMedia?.Path
  );

  console.log("READER DOCUMENT DEBUG", {
    title,
    mimeType,
    documentMedia,
    documentUrl,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E3E2DE] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!post || !documentMedia || !documentUrl) {
    return (
      <div className="min-h-screen bg-[#E3E2DE] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-[#1B1C1E] text-center">
          No se encontró un archivo PDF o EPUB para esta obra.
        </p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-5 py-2 rounded-full border border-[#1B1C1E] bg-[#F3F3F1] hover:bg-[#E6E5E2] transition"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E3E2DE]">
      <header className="z-40 bg-[#E3E2DE]/95 backdrop-blur ">
        <div className="max-w-[1200px] mx-auto px-4 my-[11px] flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center hover:bg-black/10 transition cursor-pointer"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="min-w-0">
            <h1 className="text-[18px] font-medium text-[#1B1C1E] truncate">
              {title}
            </h1>
            <p className="text-[12px] text-[#1B1C1E]/70">
              {isEpub(mimeType) ? "EPUB" : "PDF"}
            </p>
          </div>
        </div>
      </header>

      <main className="flex justify-center px-4 pb-8">
        <div
          className={
            isEpub(mimeType)
              ? "w-full sm:w-full md:w-[720px] lg:w-[1180px]"
              : "w-full lg:w-[1100px]"
          }
        >
          {isEpub(mimeType) ? (
            <EpubReader url={documentUrl} title={title} />
          ) : (
            <PdfReader url={documentUrl} />
          )}
        </div>
      </main>
    </div>
  );
}