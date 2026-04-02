// components/Home/Home.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid, message } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
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
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadMore = async () => {
    if (loading) return;
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
        setHasMore(newItems.length === 10);
      }
    } catch (err) {
      console.error("Error loading feed:", err);
      setError(t("home.errorLoadingFeed"));
      message.error(t("home.errorLoadingFeed"));
    } finally {
      setLoading(false);
    }
  };

  // Recargar al cambiar de pestaña
  const refresh = () => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
    loadMore().finally(() => setInitialLoading(false));
  };

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
    loadMore().finally(() => setInitialLoading(false));
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === "following" && !user) {
      setActiveTab("forYou");
      message.info(t("home.loginToSeeFollowing"));
    }
  }, [activeTab, user, t]);

  const handleNewPost = (newPost: PostDto) => {
    setPosts([newPost, ...posts]);
  };

  const handleLike = async (postId: string) => {
    console.log("Like", postId);
  };

  const handleRepost = async (postId: string) => {
    console.log("Repost", postId);
  };

  if (initialLoading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-[#E3E2DE] flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1351AA]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E3E2DE]">
      <main className="flex justify-center px-2 sm:px-4 gap-6">
        <div className={`flex-1 ${!isMobile ? "max-w-7xl mx-auto" : "w-full"} py-4`}>
          {user && <Composer onPost={handleNewPost} />}
          <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <InfiniteScroll
            dataLength={posts.length}
            next={loadMore}
            hasMore={hasMore}
            loader={<div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1351AA]" /></div>}
            endMessage={<p className="text-center py-4 text-gray-500">{t("home.no_more_posts")}</p>}
            style={{ overflow: "visible" }} // evita scroll interno conflictivo
          >
            <div className="space-y-6 pb-20"> {/* ← Aquí agregamos pb-20 para evitar clipping */}
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onRepost={handleRepost}
                />
              ))}
            </div>
          </InfiniteScroll>
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