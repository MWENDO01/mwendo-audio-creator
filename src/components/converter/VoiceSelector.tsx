import { useState } from "react";
import { Check, ChevronDown, Mic, Upload, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

export interface Voice {
  id: string;
  name: string;
  gender: "male" | "female";
  accent: string;
  style: string;
  isPremium: boolean;
}

const voices: Voice[] = [
  { id: "aria", name: "Aria", gender: "female", accent: "American", style: "Narrator", isPremium: false },
  { id: "roger", name: "Roger", gender: "male", accent: "British", style: "Professional", isPremium: false },
  { id: "sarah", name: "Sarah", gender: "female", accent: "American", style: "Conversational", isPremium: false },
  { id: "george", name: "George", gender: "male", accent: "British", style: "Documentary", isPremium: false },
  { id: "laura", name: "Laura", gender: "female", accent: "Australian", style: "Friendly", isPremium: true },
  { id: "charlie", name: "Charlie", gender: "male", accent: "American", style: "Energetic", isPremium: true },
  { id: "alice", name: "Alice", gender: "female", accent: "British", style: "Calm", isPremium: true },
  { id: "daniel", name: "Daniel", gender: "male", accent: "Irish", style: "Storyteller", isPremium: true },
];

interface VoiceSelectorProps {
  selectedVoice: Voice | null;
  onVoiceSelect: (voice: Voice) => void;
  isPremium: boolean;
}

const VoiceSelector = ({ selectedVoice, onVoiceSelect, isPremium }: VoiceSelectorProps) => {
  const [customVoice, setCustomVoice] = useState<File | null>(null);

  const handleCustomVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.includes("audio") || file.name.endsWith(".mp3") || file.name.endsWith(".wav"))) {
      setCustomVoice(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <Mic className="w-4 h-4 text-primary" />
          Select Voice
        </h3>
      </div>

      {/* Voice Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between h-12 bg-secondary/50">
            {selectedVoice ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {selectedVoice.name[0]}
                </div>
                <div className="text-left">
                  <div className="font-medium">{selectedVoice.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedVoice.gender === "male" ? "♂" : "♀"} {selectedVoice.accent} · {selectedVoice.style}
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">Choose a voice...</span>
            )}
            <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px] glass" align="start">
          <DropdownMenuLabel>Free Voices</DropdownMenuLabel>
          {voices.filter(v => !v.isPremium).map((voice) => (
            <DropdownMenuItem
              key={voice.id}
              onClick={() => onVoiceSelect(voice)}
              className="flex items-center gap-3 py-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                {voice.name[0]}
              </div>
              <div className="flex-1">
                <div className="font-medium">{voice.name}</div>
                <div className="text-xs text-muted-foreground">
                  {voice.gender === "male" ? "♂" : "♀"} {voice.accent} · {voice.style}
                </div>
              </div>
              {selectedVoice?.id === voice.id && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center gap-2">
            Premium Voices
            {!isPremium && <Lock className="w-3 h-3 text-accent" />}
          </DropdownMenuLabel>
          
          {voices.filter(v => v.isPremium).map((voice) => (
            <DropdownMenuItem
              key={voice.id}
              onClick={() => isPremium && onVoiceSelect(voice)}
              className={`flex items-center gap-3 py-3 cursor-pointer ${!isPremium && "opacity-50"}`}
              disabled={!isPremium}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                {voice.name[0]}
              </div>
              <div className="flex-1">
                <div className="font-medium">{voice.name}</div>
                <div className="text-xs text-muted-foreground">
                  {voice.gender === "male" ? "♂" : "♀"} {voice.accent} · {voice.style}
                </div>
              </div>
              {!isPremium && <Lock className="w-3 h-3 text-accent" />}
              {selectedVoice?.id === voice.id && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Custom Voice Upload */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Upload Custom Voice</span>
          {!isPremium && (
            <span className="text-xs text-accent flex items-center gap-1">
              <Lock className="w-3 h-3" /> Premium
            </span>
          )}
        </div>
        <label className={`flex items-center gap-3 cursor-pointer ${!isPremium && "opacity-50 pointer-events-none"}`}>
          <input
            type="file"
            accept="audio/*,.mp3,.wav"
            onChange={handleCustomVoiceUpload}
            className="hidden"
            disabled={!isPremium}
          />
          <div className="flex-1 flex items-center gap-3 p-3 rounded-lg border border-dashed border-border hover:border-primary/50 transition-colors">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {customVoice ? customVoice.name : "Upload MP3 or WAV sample"}
            </span>
          </div>
        </label>
      </div>
    </div>
  );
};

export default VoiceSelector;
