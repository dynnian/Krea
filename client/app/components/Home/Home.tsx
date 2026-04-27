// components/Home/Home.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Grid, message, Spin } from "antd";
import { useAuth } from "../../contexts/AuthContext";
import Composer from "../Composer";
import FeedTabs from "../FeedTabs";
import PostCard from "../Posts/PostCard";
import TagsSidebar from "./TagsSidebar";
import { feedApi } from "../../services/postsService";
import { feedItemToPostDto } from "../../utils/postMappers";
import type { PostDto } from "../../types/api";

const { useBreakpoint } = Grid;

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [activeTab, setActiveTab] = useState<"forYou" | "following">("forYou");
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Función para cargar una página
  const loadPage = useCallback(async (page: number, isInitial: boolean) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      let res;
      if (activeTab === "forYou") {
        res = await feedApi.getRecent(user?.id, page, 10);
      } else {
        if (!user) {
          setActiveTab("forYou");
          return;
        }
        res = await feedApi.getFollowing(page, 10);
      }
      const items = Array.isArray(res.data) ? res.data : [];
      const newPosts = items.map(feedItemToPostDto);
      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        if (isInitial) {
          setPosts(newPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }
        pageRef.current = page + 1;
        if (newPosts.length < 10) setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      message.error(t("home.errorLoadingFeed"));
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [activeTab, user, t]);

  // Observador de intersección para scroll infinito (persistente)
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current && hasMore && !initialLoading) {
          loadPage(pageRef.current, false);
        }
      },
      { rootMargin: "0px 0px 200px 0px", threshold: 0.1 }
    );
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, initialLoading, loadPage]);

  // Cargar primera página al cambiar pestaña o usuario
  useEffect(() => {
    setPosts([]);
    setHasMore(true);
    pageRef.current = 1;
    setInitialLoading(true);
    loadPage(1, true).finally(() => setInitialLoading(false));
  }, [activeTab, user, loadPage]);

  const handleNewPost = (newPost: PostDto) => {
    setPosts([newPost, ...posts]);
  };

  if (initialLoading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-[#E3E2DE] flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E3E2DE]">
      <main className="flex justify-center px-2 sm:px-4 gap-6">
        <div className={`flex-1 ${!isMobile ? "w-[870px] mx-auto" : "w-full"} py-4`}>
          {user && <Composer onPost={handleNewPost} />}
          <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="space-y-6 pb-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {loading && (
              <div className="flex justify-center py-4">
                <Spin />
              </div>
            )}
            {/* Centinela siempre presente, pero invisible cuando no hay más */}
            <div ref={sentinelRef} className="h-10 w-full" style={{ opacity: hasMore ? 1 : 0, pointerEvents: "none" }} />
            {!hasMore && posts.length > 0 && (
              <p className="text-center py-4 text-gray-500">{t("home.no_more_posts")}</p>
            )}
          </div>
        </div>
        {!isMobile && (
          <div className="w-64 shrink-0 py-2">
            <TagsSidebar />
          </div>
        )}
      </main>
    </div>
  );
}