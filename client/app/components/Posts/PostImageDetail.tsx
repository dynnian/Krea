// components/Posts/PostImageDetail.tsx
import { useNavigate } from 'react-router';
import type { PostDto } from '../../types/api.ts';

interface PostImageDetailProps {
  post: PostDto;
}

export default function PostImageDetail({ post }: PostImageDetailProps) {
  const navigate = useNavigate();

  const images = post.media
    .filter(m => m.mimeType.startsWith('image/'))
    .map(m => m.url);

  if (images.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex gap-2">
        {images.length === 1 && (
          <img
            src={images[0]}
            alt="Post image"
            className="w-full max-h-96 object-cover rounded-lg cursor-pointer"
            onClick={() => navigate(`?image=${post.id}`)}
          />
        )}
        {images.length === 2 && (
          <div className="flex gap-2 w-full">
            <img
              src={images[0]}
              alt="Post image 1"
              className="w-1/2 h-64 object-cover rounded-lg cursor-pointer"
              onClick={() => navigate(`?image=${post.id}`)}
            />
            <img
              src={images[1]}
              alt="Post image 2"
              className="w-1/2 h-64 object-cover rounded-lg cursor-pointer"
              onClick={() => navigate(`?image=${post.id}`)}
            />
          </div>
        )}
        {images.length >= 3 && (
          <div className="flex gap-2 w-full">
            <img
              src={images[0]}
              alt="Post image 1"
              className="w-1/2 h-80 object-cover rounded-lg cursor-pointer"
              onClick={() => navigate(`?image=${post.id}`)}
            />
            <div className="w-1/2 flex flex-col gap-2">
              <img
                src={images[1]}
                alt="Post image 2"
                className="w-full h-40 object-cover rounded-lg cursor-pointer"
                onClick={() => navigate(`?image=${post.id}`)}
              />
              <img
                src={images[2]}
                alt="Post image 3"
                className="w-full h-40 object-cover rounded-lg cursor-pointer"
                onClick={() => navigate(`?image=${post.id}`)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}