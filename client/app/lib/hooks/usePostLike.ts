// app/hooks/usePostLike.ts
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import { postsApi } from "../../services/postsService";

export function usePostLike(
  postId: string,
  initialLiked: boolean,
  initialCount: number,
) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggleLike = async () => {
    if (!user) {
      message.warning(t("post.auth_required"));
      navigate("/login");
      return;
    }
    if (loading) return;

    setLoading(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      if (wasLiked) {
        await postsApi.unlike(postId, { userId: user.id, postId });
      } else {
        await postsApi.like(postId, { userId: user.id, postId });
      }
    } catch {
      setLiked(wasLiked);
      setCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      message.error(t("post.like_error"));
    } finally {
      setLoading(false);
    }
  };

  return { liked, count, toggleLike, loading };
}
