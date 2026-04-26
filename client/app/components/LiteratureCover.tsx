// deno-lint-ignore-file
import { Document, Page, pdfjs } from "react-pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

type LiteratureCoverProps = {
  title?: string | null;
  coverUrl?: string | null;
  documentUrl?: string | null;
  mimeType?: string | null;
  width?: number;
  fit?: "contain" | "cover";
  className?: string;
  onClick?: () => void;
};

function isPlaceholderCover(coverUrl?: string | null) {
  return (
    coverUrl?.includes("placehold.co") ||
    coverUrl?.includes("text=Libro")
  );
}

function isPdfDocument(documentUrl?: string | null, mimeType?: string | null) {
  return (
    mimeType?.toLowerCase().includes("pdf") ||
    documentUrl?.toLowerCase().endsWith(".pdf")
  );
}

function BookCoverFallback({ title }: { title?: string | null }) {
  return (
    <div className="w-full h-full bg-[#D9D9D9] flex items-center justify-center">
      <span className="text-[#8F8E8A] text-[22px] font-bold">
        Libro
      </span>
    </div>
  );
}

export default function LiteratureCover({
  title,
  coverUrl,
  documentUrl,
  mimeType,
  width = 120,
  fit = "contain",
  className = "",
  onClick,
}: LiteratureCoverProps) {
  const hasRealCover = Boolean(
    coverUrl &&
      coverUrl.trim().length > 0 &&
      !isPlaceholderCover(coverUrl)
  );

  const canRenderPdfCover =
    !hasRealCover &&
    Boolean(documentUrl) &&
    isPdfDocument(documentUrl, mimeType);

const pdfRenderWidth = Math.round(width);

  return (
    <div
      onClick={onClick}
      className={`w-full h-full overflow-hidden bg-[#D9D9D9] ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {hasRealCover ? (
        <img
          src={coverUrl!}
          alt={title || "Cover"}
          className="w-full h-full object-cover"
        />
      ) : canRenderPdfCover ? (
        <div className="w-full h-full bg-white flex items-center justify-center overflow-hidden">
          <Document
            file={documentUrl!}
            loading={<BookCoverFallback title={title} />}
            error={<BookCoverFallback title={title} />}
          >
          <Page
            pageNumber={1}
            width={pdfRenderWidth}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
          </Document>
        </div>
      ) : (
        <BookCoverFallback title={title} />
      )}
    </div>
  );
}