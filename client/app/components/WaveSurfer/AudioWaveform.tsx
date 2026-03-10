import { useEffect, useRef, useState } from "react";

import { Button } from "antd";
import { Play, Pause } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

interface AudioWaveformProps {
  audioUrl: string;
  showPlayButton?: boolean;
  showTime?: boolean;
  onPlayingChange?: (isPlaying: boolean) => void;
  onReady?: (actions: { playPause: () => void; pause: () => void }) => void;
}

export default function AudioWaveform({
  audioUrl,
  showPlayButton = true,
  showTime = false,
  onPlayingChange,
  onReady,
}: AudioWaveformProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const pendingPlayRef = useRef(false);
  const onPlayingChangeRef = useRef(onPlayingChange);
  const onReadyRef = useRef(onReady);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);

useEffect(() => {
  onPlayingChangeRef.current = onPlayingChange;
  onReadyRef.current = onReady;
}, [onPlayingChange, onReady]);
  
  useEffect(() => {
    if (!waveformRef.current) return;

    setIsReady(false);
    setIsPlaying(false);
    pendingPlayRef.current = false;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#1351AA",
      progressColor: "#0B5107",
      cursorColor: "#8F8E8A",
      barWidth: 3,
      barRadius: 3,
      height: 60,
      normalize: true,
    });

    wavesurferRef.current = ws;

    ws.load(audioUrl);

    ws.on("decode", (decodedDuration) => {
      setDuration(decodedDuration);
    });

    ws.on("timeupdate", (time) => {
      setCurrentTime(time);
    });

    ws.on("ready", async () => {
      setIsReady(true);

      onReadyRef.current?.({
        playPause: () => {
          const current = wavesurferRef.current;
          if (!current) return;

          try {
            current.playPause();
          } catch (error) {
            console.error("Error en control externo playPause:", error);
          }
        },
        pause: () => wavesurferRef.current?.pause(),
      });

      if (pendingPlayRef.current) {
        pendingPlayRef.current = false;
        try {
          await ws.play();
        } catch (error) {
          console.error("Error reproduciendo audio al estar listo:", error);
        }
      }
    });

    ws.on("play", () => {
      setIsPlaying(true);
      onPlayingChangeRef.current?.(true);
    });

    ws.on("pause", () => {
      setIsPlaying(false);
      onPlayingChangeRef.current?.(false);
    });

  ws.on("finish", () => {
    setIsPlaying(false);
    setCurrentTime(ws.getDuration());
    onPlayingChangeRef.current?.(false);
  });

    ws.on("error", (error) => {
      console.error("WaveSurfer error:", error);
    });

    return () => {
      try {
        ws.destroy();
      } catch {
        // ignore cleanup errors
      }
      wavesurferRef.current = null;
    };
  }, [audioUrl/*, onPlayingChange, onReady*/ ]);

  const togglePlay = async () => {
    const ws = wavesurferRef.current;
    if (!ws) return;

    if (!isReady) {
      pendingPlayRef.current = true;
      return;
    }

    try {
      await ws.playPause();
    } catch (error) {
      console.error("Error al hacer play/pause:", error);
    }
  };

    const formatTime = (time: number) => {
      if (!Number.isFinite(time)) return "0:00";

      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);

      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

 return (
  <div className="flex items-start gap-4 w-full">
    {showPlayButton && (
      <Button
        shape="circle"
        icon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
        onClick={togglePlay}
        className="flex-shrink-0 mt-2"
        disabled={!isReady}
      />
    )}

    <div className="flex-1 min-w-0 relative">
      <div
        ref={waveformRef}
        className={`w-full ${!isReady ? "opacity-60" : "opacity-100"}`}
      />

      {showTime && (
        <div className="absolute right-0 top-full mt-1 text-[#1B1C1E] text-[14px] whitespace-nowrap">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      )}
    </div>
  </div>
);
}