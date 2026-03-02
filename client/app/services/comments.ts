export interface Comment {
  id: number;
  author: {
    name: string;
    handle: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLikedByUser?: boolean; // opcional, para UI
}

export async function fetchComments(postId: number): Promise<Comment[]> {
  const res = await fetch(`${API_BASE}/posts/${postId}/comments`);
  if (!res.ok) throw new Error('Error al cargar comentarios');
  return res.json();
}

export async function createComment(postId: number, content: string): Promise<Comment> {
  const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Error al publicar comentario');
  return res.json();
}

export async function likeComment(commentId: number): Promise<{ likes: number }> {
  const res = await fetch(`${API_BASE}/comments/${commentId}/like`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Error al dar like');
  return res.json();
}

export async function unlikeComment(commentId: number): Promise<{ likes: number }> {
  const res = await fetch(`${API_BASE}/comments/${commentId}/like`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al quitar like');
  return res.json();
}