import { Link2 } from "lucide-react";
import type { Post } from "../../types/post";

interface PostLinkDetailProps {
  post: Post;
}

export default function PostLinkDetail({ post }: PostLinkDetailProps) {
  const linkUpload = post.media?.find(
    (upload) => upload.media?.mime_type === "text/plain" || upload.media?.mime_type === "link"
  );
  const linkUrl = linkUpload?.media?.path || post.content?.match(/https?:\/\/[^\s]+/)?.[0];

  if (!linkUrl) return null;

  return (
    <div className="mb-6">
      <div className="bg-[#F3F3F1] p-4 rounded-lg border border-[#8F8E8A]">
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <Link2 size={18} />
          <span className="break-all">{linkUrl}</span>
        </a>
      </div>
    </div>
  );
}