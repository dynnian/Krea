// deno-lint-ignore-file
import { useEffect, useRef, useState } from "react";
import { Button, Segmented, Spin } from "antd";
import { Minus, Plus } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfReaderProps {
  url: string;
}

type PdfViewMode = "single" | "double" | "cascade";

export default function PdfReader({ url }: PdfReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isTwoPageView, setIsTwoPageView] = useState(false);
  const [viewMode, setViewMode] = useState<PdfViewMode>("double");
  const pagesWrapRef = useRef<HTMLDivElement | null>(null);
  const [pagesWrapWidth, setPagesWrapWidth] = useState(0);

  useEffect(() => {
    const updateViewMode = () => {
      setIsTwoPageView(window.innerWidth >= 1024);
    };

    updateViewMode();
    window.addEventListener("resize", updateViewMode);

    return () => {
      window.removeEventListener("resize", updateViewMode);
    };
  }, []);

  useEffect(() => {
    const element = pagesWrapRef.current;
    if (!element) return;

    const updateWidth = () => {
      setPagesWrapWidth(element.clientWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const isCascadeView = viewMode === "cascade";
  const canUseDoublePage = isTwoPageView && viewMode === "double";
  const isBookSpread = canUseDoublePage && pageNumber > 1;
  const pagesPerStep = isBookSpread ? 2 : 1;
  const rightPageNumber = pageNumber + 1;
  const canShowRightPage = isBookSpread && rightPageNumber <= numPages;

  const pageGap = 16;
  const safeWrapWidth = pagesWrapWidth || 900;

  // Tamaño base 100%.
  const doublePageBaseWidth = 520;
  const singlePageBaseWidth = 680;

  const availablePageWidth = isBookSpread
    ? Math.floor((safeWrapWidth - pageGap) / 2)
    : safeWrapWidth;

  const cascadePageBaseWidth = 760;

  const basePageWidth = isCascadeView
    ? Math.min(cascadePageBaseWidth, safeWrapWidth)
    : canUseDoublePage
      ? Math.min(doublePageBaseWidth, availablePageWidth)
      : Math.min(singlePageBaseWidth, availablePageWidth);

  const pageWidth = Math.max(260, Math.floor(basePageWidth * zoom));
    

  const goPrevious = () => {
    setPageNumber((prev) => {
      if (prev <= 1) return 1;

      // Si estamos en el primer spread real (2-3), volver a portada/página 1
      if (canUseDoublePage && prev <= 3) return 1;

      return Math.max(prev - 2, 1);
    });
  };

  const goNext = () => {
    setPageNumber((prev) => {
      if (!numPages) return prev;

      // Desde página 1, abrir el libro en páginas 2-3
    if (canUseDoublePage && prev === 1) {
      return Math.min(2, numPages);
    }
      return Math.min(prev + pagesPerStep, numPages);
    });
  };

  const handleSinglePageClick = () => {
    if (viewMode !== "single") return;
    goNext();
  };

  const handleLeftPageClick = () => {
    if (viewMode !== "double") return;
    goPrevious();
  };

  const handleRightPageClick = () => {
    if (viewMode !== "double") return;
    goNext();
  };

  return (
    <div className="">
      <div
        className={`mx-auto mb-4 bg-[#E8F1FC] border border-[#95ACCC] rounded-[12px] px-4 py-3 shadow-[4px_4px_13px_rgba(0,0,0,0.15)] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 ${
          isCascadeView ? "sticky top-[86px] z-30" : ""
        }`}
      >      
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-2">
        {!isCascadeView && (
          <div className="flex items-center gap-2">
            <Button onClick={goPrevious} disabled={pageNumber <= 1}>
              Anterior
            </Button>

            <span className="text-[14px] text-[#1B1C1E] min-w-[88px] text-center">
              {canShowRightPage
                ? `Páginas ${pageNumber}-${rightPageNumber} de ${numPages || "..."}`
                : `Página ${pageNumber} de ${numPages || "..."}`}
            </span>

            <Button onClick={goNext} disabled={!numPages || pageNumber >= numPages}>
              Siguiente
            </Button>
          </div>
        )}

        {isCascadeView && (
          <span className="text-[14px] text-[#1B1C1E]">
            {numPages ? `${numPages} páginas` : "Cargando páginas..."}
          </span>
        )}

        <div className="flex items-center gap-2 sm:pl-[20px] w-full sm:w-auto">
                <Segmented<PdfViewMode>
              size="large"
              rootClassName="pdf-view-mode-segmented"
              value={viewMode}
              onChange={(value) => {
                const nextMode = value as PdfViewMode;

                setViewMode(nextMode);

                if (nextMode === "double") {
                  setPageNumber((prev) => {
                    if (prev <= 1) return 1;
                    return prev % 2 === 0 ? prev : prev - 1;
                  });
                }
              }}
              options={[
                {
                  label: "1 página",
                  value: "single",
                },
                {
                  label: "2 páginas",
                  value: "double",
                  disabled: !isTwoPageView,
                },
                {
                  label: "Cascada",
                  value: "cascade",
                },
              ]}
            />
          </div>

        </div>

        <div className="flex items-center gap-2">
          <Button
            type="default"
            icon={<Minus size={15} />}
            onClick={() => setZoom((prev) => Math.max(prev - 0.1, 0.7))}
          />

          <span className="text-[14px] min-w-[48px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <Button
            type="default"
            icon={<Plus size={15} />}
            onClick={() => setZoom((prev) => Math.min(prev + 0.1, 2))}
          />
        </div>
      </div>

      <div
        ref={pagesWrapRef}
        className="relative left-1/2 w-[calc(100vw-32px)] -translate-x-1/2 flex justify-center overflow-x-auto pb-4"
      >
        <Document
          file={url}
          onSourceError={(error) => {
            console.error("PDF source error:", error, url);
          }}
          onLoadError={(error) => {
            console.error("PDF load error:", error, url);
          }}
          loading={
            <div className="py-20 flex justify-center">
              <Spin size="large" />
            </div>
          }
          error={
            <div className="bg-[#E8F1FC] border border-[#95ACCC] rounded-[12px] p-6 text-center">
              No se pudo cargar el PDF.
            </div>
          }
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
            setPageNumber(1);
          }}
        >
        {isCascadeView ? (
          <div className="flex flex-col items-center gap-6">
            {Array.from({ length: numPages }, (_, index) => {
              const currentPageNumber = index + 1;

              return (
                <div
                  key={currentPageNumber}
                  className="bg-white rounded-[10px] overflow-hidden shadow-[4px_4px_13px_rgba(0,0,0,0.25)]"
                >
                  <Page
                    pageNumber={currentPageNumber}
                    width={pageWidth}
                    renderAnnotationLayer
                    renderTextLayer
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex justify-center items-start gap-4">
            <div
              onClick={viewMode === "single" ? handleSinglePageClick : handleLeftPageClick}
              className="bg-white rounded-[10px] overflow-hidden shadow-[4px_4px_13px_rgba(0,0,0,0.25)] cursor-pointer"
            >
              <Page
                pageNumber={pageNumber}
                width={pageWidth}
                renderAnnotationLayer
                renderTextLayer
              />
            </div>

            {canShowRightPage && (
              <div
                onClick={handleRightPageClick}
                className="bg-white rounded-[10px] overflow-hidden shadow-[4px_4px_13px_rgba(0,0,0,0.25)] cursor-pointer"
              >
                <Page
                  pageNumber={rightPageNumber}
                  width={pageWidth}
                  renderAnnotationLayer
                  renderTextLayer
                />
              </div>
            )}
          </div>
        )}
        </Document>
      </div>
    </div>
  );
}