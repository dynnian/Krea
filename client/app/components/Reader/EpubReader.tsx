// deno-lint-ignore-file
import { useEffect, useMemo, useRef, useState } from "react";
import { ReactReader, ReactReaderStyle } from "react-reader";

interface EpubReaderProps {
  url: string;
  title: string;
}

export default function EpubReader({ url, title }: EpubReaderProps) {
  const [location, setLocation] = useState<string | number>(0);
  const [readerSize, setReaderSize] = useState({ width: 0, height: 0 });
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const renditionRef = useRef<any>(null);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    const updateSize = () => {
      setReaderSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const updateViewportMode = () => {
      setIsNarrowViewport(window.innerWidth < 1024);
    };

    updateViewportMode();
    window.addEventListener("resize", updateViewportMode);

    return () => {
      window.removeEventListener("resize", updateViewportMode);
    };
  }, []);

  const isSinglePageReader = isNarrowViewport || readerSize.width < 1024;
  const spreadMode = isSinglePageReader ? "none" : "auto";
  const flowMode = isSinglePageReader ? "scrolled-doc" : "paginated";

  useEffect(() => {
    const rendition = renditionRef.current;
    if (!rendition) return;

    try {
      rendition.spread(spreadMode);

      if (rendition.settings) {
        rendition.settings.spread = spreadMode;
        rendition.settings.minSpreadWidth = isSinglePageReader ? 999999 : 1024;
      }
    } catch (error) {
      console.error("Error forcing EPUB spread mode:", error);
    }
  }, [spreadMode, isSinglePageReader]);

  const readerStyles = useMemo(
    () => ({
      ...ReactReaderStyle,
      container: {
        ...ReactReaderStyle.container,
        height: "100%",
        width: "100%",
      },
      readerArea: {
        ...ReactReaderStyle.readerArea,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        transition: "none",
      },
      titleArea: {
        ...ReactReaderStyle.titleArea,
        display: "none",
      },
      tocButton: {
        ...ReactReaderStyle.tocButton,
        color: "#1351AA",
        left: 20,
        top: 18,
        width: 32,
        height: 32,
        zIndex: 20,
      },
      arrow: {
        ...ReactReaderStyle.arrow,
        color: "#8F8E8A",
      },
      arrowHover: {
        ...ReactReaderStyle.arrowHover,
        color: "#1351AA",
      },
    }),
    []
  );

  return (
    <div
      ref={wrapperRef}
      className="relative left-1/2 w-[calc(100vw-32px)] md:w-full -translate-x-1/2 md:translate-x-0 md:left-auto h-[calc(100vh-150px)] min-h-[650px] max-sm:min-h-[calc(100vh-170px)] bg-[#F3F3F1] rounded-[14px] border border-[#8F8E8A] overflow-hidden shadow-[4px_4px_13px_rgba(0,0,0,0.18)]"
    >
      {readerSize.width > 0 && readerSize.height > 0 && (
        <ReactReader
          key={`${isSinglePageReader ? "single" : "spread"}-${url}`}
          url={url}
          title={title}
          location={location}
          locationChanged={(epubcfi: string) => setLocation(epubcfi)}
          readerStyles={readerStyles}
          getRendition={(rendition: any) => {
            renditionRef.current = rendition;

            try {
              rendition.spread(spreadMode);

              if (rendition.settings) {
                rendition.settings.spread = spreadMode;
                rendition.settings.minSpreadWidth = isSinglePageReader ? 999999 : 1024;
              }
            } catch (error) {
              console.error("Error setting EPUB spread mode:", error);
            }

            try {
              rendition.flow(flowMode);
            } catch (error) {
              console.error("Error setting EPUB flow mode:", error);
            }

            rendition.themes.default({
              html: {
                width: "100% !important",
                height: "100% !important",
              },
              body: {
                width: "100% !important",
                "max-width": "none !important",
                margin: "0 !important",
                padding: isSinglePageReader
                  ? "32px 32px 24px 32px !important"
                  : "40px 48px 32px 48px !important",
                "font-size": "100%",
                "line-height": "1.6",
              },
              p: {
                "text-align": "justify",
              },
            });
          }}
          epubOptions={{
            flow: flowMode,
            manager: "default",
            spread: spreadMode,
            minSpreadWidth: isSinglePageReader ? 999999 : 1024,
          }}
        />
      )}
    </div>
  );
}