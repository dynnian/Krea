import { useEffect, useState } from "react";
import { useParams } from "react-router";
import PostDetail from "../components/Posts/PostDetail";
import { mockPosts } from "../data/mockPosts"; // Simular obtención de datos
import type { Post } from "../types/post";

export default function PostRoute() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular fetch de post por id
    const found = mockPosts.find((p) => p.id === Number(id));
    setPost(found || null);
    setLoading(false);
  }, [id]);

  if (loading) return <div>Cargando...</div>;
  if (!post) return <div>Publicación no encontrada</div>;

  return <PostDetail post={post} />;
}