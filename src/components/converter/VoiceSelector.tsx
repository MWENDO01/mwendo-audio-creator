import { useState, useRef } from "react";
import { Check, ChevronDown, Mic, Upload, Lock, Play, Pause, Volume2, Globe, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";

export interface Voice {
  id: string;
  name: string;
  gender: "male" | "female";
  accent: string;
  style: string;
  isPremium: boolean;
  previewText?: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: "auto", name: "Auto-detect", flag: "🌐" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "id", name: "Indonesian", flag: "🇮🇩" },
  { code: "fil", name: "Filipino", flag: "🇵🇭" },
  { code: "ta", name: "Tamil", flag: "🇮🇳" },
  { code: "uk", name: "Ukrainian", flag: "🇺🇦" },
  { code: "el", name: "Greek", flag: "🇬🇷" },
  { code: "cs", name: "Czech", flag: "🇨🇿" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "hr", name: "Croatian", flag: "🇭🇷" },
  { code: "ms", name: "Malay", flag: "🇲🇾" },
  { code: "sk", name: "Slovak", flag: "🇸🇰" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "bg", name: "Bulgarian", flag: "🇧🇬" },
  { code: "ro", name: "Romanian", flag: "🇷🇴" },
  { code: "hu", name: "Hungarian", flag: "🇭🇺" },
];

const voices: Voice[] = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", gender: "female", accent: "American", style: "Conversational", isPremium: false, previewText: "Hello! I'm Sarah, your friendly conversational voice assistant." },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", gender: "male", accent: "British", style: "Professional", isPremium: false, previewText: "Good day. I'm Roger, here to deliver your content with professionalism." },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", gender: "male", accent: "British", style: "Documentary", isPremium: false, previewText: "Welcome. I'm George, perfect for documentaries and narration." },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", gender: "female", accent: "British", style: "Narrator", isPremium: false, previewText: "Hello there. I'm Alice, your elegant narrator for any story." },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", gender: "female", accent: "American", style: "Friendly", isPremium: true, previewText: "Hey! I'm Laura, bringing warmth and friendliness to your content." },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", gender: "male", accent: "Australian", style: "Energetic", isPremium: true, previewText: "G'day! Charlie here, ready to energize your audio projects!" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", gender: "male", accent: "British", style: "Storyteller", isPremium: true, previewText: "Greetings. I'm Daniel, your captivating storyteller for immersive tales." },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", gender: "female", accent: "British", style: "Calm", isPremium: true, previewText: "Hello. I'm Lily, bringing calm and serenity to your audio content." },
];

interface VoiceSelectorProps {
  selectedVoice: Voice | null;
  onVoiceSelect: (voice: Voice) => void;
  isPremium: boolean;
  selectedLanguage?: string;
  onLanguageSelect?: (language: string) => void;
  multiVoiceEnabled?: boolean;
  onMultiVoiceToggle?: (enabled: boolean) => void;
}

const VoiceSelector = ({ 
  selectedVoice, 
  onVoiceSelect, 
  isPremium, 
  selectedLanguage = "auto", 
  onLanguageSelect,
  multiVoiceEnabled = true,
  onMultiVoiceToggle,
}: VoiceSelectorProps) => {
  const [customVoice, setCustomVoice] = useState<File | null>(null);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const currentLanguage = LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];

  const handleCustomVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.includes("audio") || file.name.endsWith(".mp3") || file.name.endsWith(".wav"))) {
      setCustomVoice(file);
    }
  };

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPreviewingVoice(null);
  };

  const handlePreviewVoice = async (e: React.MouseEvent, voice: Voice) => {
    e.stopPropagation();
    e.preventDefault();
    
    // If already previewing this voice, stop it
    if (previewingVoice === voice.id) {
      stopPreview();
      return;
    }

    // Stop any current preview
    stopPreview();
    
    // Check if premium voice and user is not premium
    if (voice.isPremium && !isPremium) {
      toast.error("Upgrade to Premium to preview this voice");
      return;
    }

    setIsLoadingPreview(voice.id);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            text: voice.previewText || `Hi, I'm ${voice.name}. This is how I sound.`, 
            voiceId: voice.id 
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate preview");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setPreviewingVoice(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setPreviewingVoice(null);
        toast.error("Failed to play preview");
      };

      await audio.play();
      setPreviewingVoice(voice.id);
    } catch (error) {
      console.error("Preview error:", error);
      toast.error("Failed to preview voice");
    } finally {
      setIsLoadingPreview(null);
    }
  };

  const VoiceItem = ({ voice, showLock = false }: { voice: Voice; showLock?: boolean }) => (
    <DropdownMenuItem
      key={voice.id}
      onClick={() => (!voice.isPremium || isPremium) && onVoiceSelect(voice)}
      className={`flex items-center gap-3 py-3 cursor-pointer ${voice.isPremium && !isPremium && "opacity-50"}`}
      disabled={voice.isPremium && !isPremium}
    >
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${voice.isPremium ? 'from-accent to-primary' : 'from-primary to-accent'} flex items-center justify-center text-xs font-bold text-primary-foreground`}>
        {voice.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{voice.name}</div>
        <div className="text-xs text-muted-foreground">
          {voice.gender === "male" ? "♂" : "♀"} {voice.accent} · {voice.style}
        </div>
      </div>
      
      {/* Preview Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 flex-shrink-0"
        onClick={(e) => handlePreviewVoice(e, voice)}
        disabled={isLoadingPreview === voice.id}
      >
        {isLoadingPreview === voice.id ? (
          <motion.div
            className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : previewingVoice === voice.id ? (
          <Pause className="w-3.5 h-3.5 text-primary" />
        ) : (
          <Play className="w-3.5 h-3.5" />
        )}
      </Button>
      
      {showLock && !isPremium && <Lock className="w-3 h-3 text-accent flex-shrink-0" />}
      {selectedVoice?.id === voice.id && (
        <Check className="w-4 h-4 text-primary flex-shrink-0" />
      )}
    </DropdownMenuItem>
  );

  return (
    <div className="space-y-4">
      {/* Language Selector */}
      <div className="space-y-2">
        <h3 className="font-medium flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          Language
        </h3>
        <Select value={selectedLanguage} onValueChange={(value) => onLanguageSelect?.(value)}>
          <SelectTrigger className="w-full h-12 bg-secondary/50">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentLanguage.flag}</span>
                <span>{currentLanguage.name}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px] bg-popover">
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Auto-detect works best for most content. Select a specific language for better accuracy.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <Mic className="w-4 h-4 text-primary" />
          Select Voice
        </h3>
        {previewingVoice && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-xs text-primary"
          >
            <Volume2 className="w-3 h-3 animate-pulse" />
            <span>Playing preview...</span>
            <Button variant="ghost" size="sm" className="h-5 px-2 text-xs" onClick={stopPreview}>
              Stop
            </Button>
          </motion.div>
        )}
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
        <DropdownMenuContent className="w-[340px] bg-popover border border-border" align="start">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Free Voices</span>
            <span className="text-xs text-muted-foreground font-normal">Click play to preview</span>
          </DropdownMenuLabel>
          {voices.filter(v => !v.isPremium).map((voice) => (
            <VoiceItem key={voice.id} voice={voice} />
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center gap-2">
            Premium Voices
            {!isPremium && <Lock className="w-3 h-3 text-accent" />}
          </DropdownMenuLabel>
          
          {voices.filter(v => v.isPremium).map((voice) => (
            <VoiceItem key={voice.id} voice={voice} showLock />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Multi-Voice Mode Toggle */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Users className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <Label htmlFor="multi-voice" className="font-medium cursor-pointer">
                Multi-Voice Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Auto-assign voices for conversations & detect emotions
              </p>
            </div>
          </div>
          <Switch
            id="multi-voice"
            checked={multiVoiceEnabled}
            onCheckedChange={(checked) => onMultiVoiceToggle?.(checked)}
          />
        </div>
        {multiVoiceEnabled && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              <span className="text-primary font-medium">✨ Active:</span> Questions read with rising intonation, dialogues get unique voices, emotions detected automatically.
            </p>
          </div>
        )}
      </div>

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
