// components/Home/Home.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid, message, Spin } from "antd";
import { useAuth } from "../../contexts/AuthContext";
import Composer from "../Composer";
import FeedTabs from "../FeedTabs";
import PostCard from "../Posts/PostCard";
import TagsSidebar from "./TagsSidebar";
import { feedApi } from "../../services/postsService";
import { feedItemToPostDto } from "../../utils/postMappers";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll.ts";
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  // Cargar más elementos
  const loadMore = async () => {
    if (loading || !hasMore) return;
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
        res = await feedApi.getFollowing(user.id, page, 10);
      }
      const newItems = res.data.map(feedItemToPostDto);
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...newItems]);
        setPage((prev) => prev + 1);
        if (newItems.length < 10) setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading feed:", err);
      message.error(t("home.errorLoadingFeed"));
    } finally {
      setLoading(false);
    }
  };

  // Resetear al cambiar pestaña o usuario
  const resetAndLoad = () => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
    setLoading(false);
    loadMore().finally(() => setInitialLoading(false));
  };

  useEffect(() => {
    resetAndLoad();
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === "following" && !user) {
      setActiveTab("forYou");
      message.info(t("home.loginToSeeFollowing"));
    }
  }, [activeTab, user, t]);

  // Centinela para scroll infinito
  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: loading,
    onLoadMore: loadMore,
    rootMargin: "0px 0px 200px 0px", // carga cuando el centinela está a 200px del viewport
  });

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
            {/* Centinela: invisible, solo para activar la carga */}
            {hasMore && (
              <div ref={sentinelRef} className="h-10 w-full" />
            )}
            {loading && (
              <div className="flex justify-center py-4">
                <Spin />
              </div>
            )}
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