// components/Home/Home.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid, message } from "antd";
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

  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      setError(null);
      try {
        let feedItems;
        if (activeTab === "forYou") {
          const res = await feedApi.getRecent(user?.id);
          feedItems = res.data;
        } else {
          if (!user) {
            setActiveTab("forYou");
            return;
          }
          const res = await feedApi.getFollowing(user.id);
          feedItems = res.data;
        }
        const mapped = feedItems.map(feedItemToPostDto);
        setPosts(mapped);
      } catch (err) {
        console.error("Error loading feed:", err);
        setError(t("home.errorLoadingFeed"));
        message.error(t("home.errorLoadingFeed"));
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [activeTab, user, t]);

  // Si no hay usuario y la pestaña es "following", cambiar a "forYou"
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
    // Llamada real con postsApi.like / unlike
  };

  const handleRepost = async (postId: string) => {
    console.log("Repost", postId);
    // Llamada real con postsApi.repost
  };

  return (
    <div className="min-h-screen bg-[#E3E2DE]">
      <main className="flex justify-center px-2 sm:px-4 gap-6">
        {/* Columna principal: feed */}
        <div
         className={`
            flex-1
            ${!isMobile
              ? "min-w-[400px] max-w-7xl bg-[#E8F1FC] border-l-2 border-r-2 border-[#8F8E8A] px-6 py-6"
              : "px-2 w-full"
            }
          `}
        >
          {user && <Composer onPost={handleNewPost} />}
          <FeedTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isMobile={isMobile}
          />
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1351AA]" />
            </div>
          )}
          {error && (
            <div className="text-center py-8 text-red-500">{error}</div>
          )}
          {!loading && !error && (
            <div className="space-y-4 sm:space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onRepost={handleRepost}
                />
              ))}
              {posts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {t("home.noPosts")}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar de tags (solo en desktop) */}
        {!isMobile && (
          <div className="w-64 shrink-0 py-2">
            <TagsSidebar />
          </div>
        )}
      </main>
    </div>
  );
}