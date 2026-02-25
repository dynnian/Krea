import { useRef, useEffect, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause } from "lucide-react";
import type { Post } from "../../types/post";

interface PostAudioDetailProps {
  post: Post;
}

export default function PostAudioDetail({ post }: PostAudioDetailProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Obtener el primer audio de los media
  const audioUpload = post.media?.find(
    (upload) => upload.media?.mime_type.startsWith("audio/")
  );
  const audioUrl = audioUpload?.media?.path;
  const albumArt = post.media?.find(
    (upload) => upload.media?.mime_type.startsWith("image/")
  )?.media?.path;

  useEffect(() => {
    if (!waveformRef.current || !audioUrl) return;

    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#1351AA",
      progressColor: "#0B5107",
      cursorColor: "#8F8E8A",
      barWidth: 3,
      barRadius: 3,
      height: 60,
    });

    wavesurferRef.current.load(audioUrl);
    wavesurferRef.current.on("finish", () => setIsPlaying(false));

    return () => {
      wavesurferRef.current?.destroy();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  if (!audioUrl) return null;

  return (
    <div className="mb-6">
      <div className="flex gap-4">
        <div className="w-1/3">
          <img
            src={albumArt || "https://placehold.co/202x202"}
            alt="Album art"
            className="w-full rounded-lg shadow-lg"
          />
        </div>
        <div className="w-2/3">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={togglePlay}
              className="w-12 h-12 bg-[#1351AA] text-white rounded-full flex items-center justify-center hover:bg-[#0f3d7a] transition"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {post.title || "Título de la canción"}
              </h2>
              <p className="text-gray-600">
                {post.author?.name || "Artista"}
              </p>
            </div>
          </div>
          <div ref={waveformRef} className="w-full" />
        </div>
      </div>
    </div>
  );
}