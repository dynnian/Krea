import { useEffect, useState } from "react";
import { useParams } from "react-router";
import PostDetail from "../components/Posts/PostDetail";
import { mockPosts } from "../data/mockPosts"; // Simular obtención de datos
import type { Post } from "../types/post";
import { postsApi } from "~/services/postsService";

export default function PostRoute() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    postsApi.getPost(id)
      .then(setPost)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Cargando...</div>;
  if (!post) return <div>Publicación no encontrada</div>;

  return <PostDetail post={post} />;
}