import { useEffect, useCallback } from "react";

interface UseScrollPaginationProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number; 
}

export function useScrollPagination({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200,
}: UseScrollPaginationProps) {
  const handleScroll = useCallback(() => {
    if (isLoading || !hasMore) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    // Si estamos a menos de 'threshold' píxeles del fondo
    if (scrollTop + windowHeight >= docHeight - threshold) {
      onLoadMore();
    }
  }, [isLoading, hasMore, onLoadMore, threshold]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
}