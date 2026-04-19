// deno-lint-ignore-file
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause } from 'lucide-react';
import AudioWaveform from '../WaveSurfer/AudioWaveform.tsx'
import type { PostDto } from '../../types/api.ts';

interface PostAudioDetailProps {
  post: PostDto;
  formattedDate: string;
  formattedTime: string;
  menuItems: any[];
}

import { Dropdown, Avatar } from 'antd';
import { MoreHorizontal, User } from 'lucide-react';

export default function PostAudioDetail({
  post,
  formattedDate,
  formattedTime,
  menuItems,
}: PostAudioDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const waveformControls = useRef<{
    playPause: () => void;
    pause: () => void;
  } | null>(null);

  // Incluye "music/mpeg" además de "audio/"
  const audioMedia = post.media.find(
    m => m.mimeType.startsWith('audio/') || m.mimeType === 'music/mpeg'
  );
  const audioUrl = audioMedia?.url;
  const imageMedia = post.media.find(m => m.mimeType.startsWith('image/'));

  const albumArt =
    audioMedia?.coverUrl ||
    (audioMedia as any)?.CoverUrl ||
    imageMedia?.url ||
    null;



  const togglePlay = () => {
    waveformControls.current?.playPause();
  };

  if (!audioUrl) return null;

  return (
    <div className="mb-2">
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-4 mb-6">
            <div className="flex items-start gap-4 min-w-0">
              <Link to={`/profile/${post.authorPostId}`}>
                <Avatar
                  icon={<User />}
                  size={72}
                  className="bg-white border border-black rounded-full shrink-0 cursor-pointer"
                />
              </Link>

              <div className="min-w-0">
                <h2 className="text-[28px] md:text-[36px] leading-[1.05] font-semibold text-[#1B1C1E]">
                  {post.title || 'TÍTULO DE LA CANCIÓN'}
                </h2>

                <Link
                  to={`/user/${post.authorPostId}`}
                  className="mt-2 block text-[18px] md:text-[20px] leading-[1.2] text-[#1B1C1E] hover:underline"
                >
                  <span>{post.authorName || `Usuario ${post.authorPostId.slice(0, 8)}`}</span>
                  <span className="mx-2">·</span>
                  <span>@{post.authorName || post.authorPostId.slice(0, 8)}</span>
                </Link>
              </div>
            </div>

            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
              <button type="button" className="hover:bg-gray-200 rounded-full p-1 shrink-0">
                <MoreHorizontal size={20} className="text-gray-500" />
              </button>
            </Dropdown>
          </div>

          {post.content && (
            <p className="text-[15px] md:text-[16px] leading-[1.8] text-[#1B1C1E] text-justify mb-6 max-w-[760px]">
              {post.content}
            </p>
          )}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={togglePlay}
              className="w-[54px] h-[54px] rounded-full border border-[#1B1C1E] bg-[#E9FDE8] flex items-center justify-center text-[#0B5107] cursor-pointer transition hover:scale-[1.03] shrink-0"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            <div className="flex-1 min-w-0">
              <AudioWaveform
                audioUrl={audioUrl}
                showPlayButton={false}
                showTime={false}
                onPlayingChange={setIsPlaying}
                onReady={(actions) => {
                  waveformControls.current = actions;
                }}
              />
            </div>
          </div>
        </div>

        <div className="w-[170px] h-[170px] md:w-[220px] md:h-[220px] shrink-0 overflow-hidden rounded-[10px] shadow-[4px_4px_13px_rgba(0,0,0,0.25)] bg-[#D9D9D9]">
          <img
            src={albumArt || 'https://placehold.co/220x220'}
            alt="Album art"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

     <div className="flex items-center gap-2 text-sm text-gray-600 mt-6">
        <span>{formattedTime}</span>
        <span>·</span>
        <span>{formattedDate}</span>
      </div>
    </div>
  );
}