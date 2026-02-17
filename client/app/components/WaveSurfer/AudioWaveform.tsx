import { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { Play, Pause } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

interface AudioWaveformProps {
  audioUrl: string;
}

export default function AudioWaveform({ audioUrl }: AudioWaveformProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!waveformRef.current) return;

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

  return (
    <div className="flex items-center gap-4 w-full">
      <Button
        shape="circle"
        icon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
        onClick={togglePlay}
        className="flex-shrink-0"
      />
      <div ref={waveformRef} className="flex-1" />
    </div>
  );
}