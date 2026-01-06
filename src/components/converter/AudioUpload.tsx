import { useState, useRef } from "react";
import { Upload, Mic, FileAudio, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AudioUploadProps {
  onTranscriptionComplete: (text: string) => void;
}

const AudioUpload = ({ onTranscriptionComplete }: AudioUploadProps) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFormats = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/webm",
    "audio/ogg",
    "audio/flac",
    "audio/m4a",
    "audio/mp4",
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!acceptedFormats.includes(file.type) && !file.name.match(/\.(mp3|wav|webm|ogg|flac|m4a)$/i)) {
      toast.error("Please upload a valid audio file (MP3, WAV, WebM, OGG, FLAC, M4A)");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size must be less than 100MB");
      return;
    }

    setAudioFile(file);
  };

  const handleTranscribe = async () => {
    if (!audioFile) {
      toast.error("Please select an audio file first");
      return;
    }

    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append("audio", audioFile);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Transcription failed");
      }

      const data = await response.json();
      
      if (data.text) {
        onTranscriptionComplete(data.text);
        toast.success("Audio transcribed successfully!");
        setAudioFile(null);
      } else {
        throw new Error("No transcription text received");
      }
    } catch (error) {
      console.error("Transcription error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to transcribe audio");
    } finally {
      setIsTranscribing(false);
    }
  };

  const removeFile = () => {
    setAudioFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive
            ? "border-primary bg-primary/5"
            : audioFile
            ? "border-accent bg-accent/5"
            : "border-border hover:border-primary/50 hover:bg-secondary/30"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isTranscribing}
        />

        {audioFile ? (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
              <FileAudio className="w-8 h-8 text-accent" />
            </div>
            <div>
              <p className="font-medium">{audioFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              disabled={isTranscribing}
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Drop your audio file here</p>
              <p className="text-sm text-muted-foreground">
                or click to browse (MP3, WAV, WebM, OGG, FLAC, M4A)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Transcribe Button */}
      <Button
        variant="gradient"
        size="lg"
        className="w-full"
        onClick={handleTranscribe}
        disabled={!audioFile || isTranscribing}
      >
        {isTranscribing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Transcribing...
          </>
        ) : (
          <>
            <Mic className="w-5 h-5 mr-2" />
            Transcribe Audio
          </>
        )}
      </Button>

      {/* Info */}
      <p className="text-xs text-muted-foreground text-center">
        Powered by ElevenLabs • Supports speaker diarization and audio event detection
      </p>
    </div>
  );
};

export default AudioUpload;
