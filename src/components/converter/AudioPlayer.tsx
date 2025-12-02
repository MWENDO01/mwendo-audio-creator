import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

interface AudioPlayerProps {
  audioUrl: string | null;
  fileName: string;
  isGenerating: boolean;
}

const AudioPlayer = ({ audioUrl, fileName, isGenerating }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `${fileName}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (isGenerating) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 card-shadow"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <div>
            <p className="font-medium">Generating Audio...</p>
            <p className="text-sm text-muted-foreground">This may take a moment</p>
          </div>
        </div>
        
        {/* Progress Bar Animation */}
        <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
      </motion.div>
    );
  }

  if (!audioUrl) {
    return (
      <div className="glass rounded-2xl p-6 card-shadow text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
          <Play className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">
          Your generated audio will appear here
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 card-shadow"
    >
      <audio ref={audioRef} src={audioUrl} />
      
      {/* File Name */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-medium">{fileName}</p>
          <p className="text-sm text-muted-foreground">MP3 Audio</p>
        </div>
        <Button variant="gradient" size="sm" onClick={downloadAudio}>
          <Download className="w-4 h-4 mr-1" />
          Download
        </Button>
      </div>

      {/* Waveform Visualization (Simplified) */}
      <div className="flex items-center gap-0.5 h-12 mb-4">
        {[...Array(50)].map((_, i) => {
          const progress = currentTime / duration;
          const isActive = i / 50 <= progress;
          return (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-150 ${
                isActive ? "bg-primary" : "bg-secondary"
              }`}
              style={{ height: `${Math.random() * 60 + 40}%` }}
            />
          );
        })}
      </div>

      {/* Progress Slider */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={restart}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            variant="gradient"
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default AudioPlayer;
