"use client";

import { useState, useRef, useEffect } from "react";
import { Pause, Play, Volume2, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  audioBlob?: Blob;
  onRemove?: () => void;
}

export function AudioPlayer({ audioBlob, onRemove }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioBlob]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      audioRef.current.play();
      animationRef.current = requestAnimationFrame(updateProgress);
    }

    setIsPlaying(!isPlaying);
  };

  const updateProgress = () => {
    if (!audioRef.current) return;

    setCurrentTime(audioRef.current.currentTime);
    animationRef.current = requestAnimationFrame(updateProgress);
  };

  const handleSliderChange = (value: number[]) => {
    if (!audioRef.current) return;

    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;

    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const duration = audioRef.current?.duration || 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!audioURL) return null;

  return (
    <div className="flex items-center gap-4 p-2 bg-muted/30 rounded-lg">
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayPause}
        className="rounded-full"
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>
      
      <div className="flex-1">
        <Slider
          value={[currentTime]}
          max={duration}
          onValueChange={handleSliderChange}
          className="w-full"
        />
      </div>
      
      <div className="text-sm text-muted-foreground">
        {Math.floor(currentTime)} / {Math.floor(duration)}s
      </div>
      
      <div className="flex items-center gap-2 w-24">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={[volume]}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="w-full"
        />
      </div>
      
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-destructive hover:text-destructive"
        >
          <Trash className="h-5 w-5" />
        </Button>
      )}
      
      <audio
        ref={audioRef}
        src={audioURL}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
}