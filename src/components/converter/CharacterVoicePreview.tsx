import { useState, useRef } from "react";
import { Play, Pause, Baby, Skull, Crown, User, Heart, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CharacterType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  sampleText: string;
  color: string;
  // Voice variation settings (matching backend)
  settings: {
    stability: number;
    similarity_boost: number;
    style: number;
  };
}

const CHARACTER_TYPES: CharacterType[] = [
  {
    id: "narrator",
    name: "Narrator",
    icon: <BookOpen className="w-4 h-4" />,
    description: "Calm, balanced storytelling",
    sampleText: "Once upon a time, in a land far away, there lived a brave hero who would change the world forever.",
    color: "from-blue-500 to-blue-600",
    settings: { stability: 0.75, similarity_boost: 0.85, style: 0.5 },
  },
  {
    id: "child",
    name: "Child",
    icon: <Baby className="w-4 h-4" />,
    description: "Playful, energetic voice",
    sampleText: "Wow! Look at that! Can we go play? Please, please, please!",
    color: "from-pink-500 to-rose-500",
    settings: { stability: 0.4, similarity_boost: 0.5, style: 0.9 },
  },
  {
    id: "villain",
    name: "Villain",
    icon: <Skull className="w-4 h-4" />,
    description: "Dark, menacing tone",
    sampleText: "You think you can defeat me? How amusing. Your futile efforts will only hasten your demise.",
    color: "from-purple-600 to-violet-700",
    settings: { stability: 0.3, similarity_boost: 0.65, style: 0.95 },
  },
  {
    id: "deep_male",
    name: "Authority",
    icon: <Crown className="w-4 h-4" />,
    description: "Deep, commanding presence",
    sampleText: "Listen carefully. What I'm about to tell you will determine the fate of our entire kingdom.",
    color: "from-amber-600 to-orange-600",
    settings: { stability: 0.85, similarity_boost: 0.6, style: 0.3 },
  },
  {
    id: "soft_female",
    name: "Gentle",
    icon: <Heart className="w-4 h-4" />,
    description: "Soft, caring warmth",
    sampleText: "Don't worry, everything is going to be alright. I'm here for you, always.",
    color: "from-emerald-500 to-teal-500",
    settings: { stability: 0.8, similarity_boost: 0.75, style: 0.4 },
  },
  {
    id: "energetic",
    name: "Excited",
    icon: <Zap className="w-4 h-4" />,
    description: "High energy, enthusiastic",
    sampleText: "This is absolutely incredible! I can't believe we actually did it! We're going to change everything!",
    color: "from-yellow-500 to-amber-500",
    settings: { stability: 0.35, similarity_boost: 0.7, style: 0.85 },
  },
  {
    id: "elderly",
    name: "Elder",
    icon: <User className="w-4 h-4" />,
    description: "Wise, aged character",
    sampleText: "In my many years, I have seen much. Let me share with you the wisdom of ages past.",
    color: "from-slate-500 to-slate-600",
    settings: { stability: 0.9, similarity_boost: 0.55, style: 0.25 },
  },
];

interface CharacterVoicePreviewProps {
  selectedVoiceId: string;
  disabled?: boolean;
}

const CharacterVoicePreview = ({ selectedVoiceId, disabled = false }: CharacterVoicePreviewProps) => {
  const [playingCharacter, setPlayingCharacter] = useState<string | null>(null);
  const [loadingCharacter, setLoadingCharacter] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingCharacter(null);
  };

  const handlePreviewCharacter = async (character: CharacterType) => {
    if (disabled) {
      toast.error("Select a voice first to preview character variations");
      return;
    }

    // If already playing this character, stop it
    if (playingCharacter === character.id) {
      stopPreview();
      return;
    }

    // Stop any current preview
    stopPreview();
    setLoadingCharacter(character.id);

    try {
      // Get current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to preview character voices");
        setLoadingCharacter(null);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            text: character.sampleText,
            voiceId: selectedVoiceId,
            enableMultiVoice: false, // We manually set settings
            // Pass custom voice settings for this character type
            voiceSettings: character.settings,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate preview");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingCharacter(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setPlayingCharacter(null);
        toast.error("Failed to play preview");
      };

      await audio.play();
      setPlayingCharacter(character.id);
    } catch (error) {
      console.error("Character preview error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to preview character voice");
    } finally {
      setLoadingCharacter(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">Preview Character Variations</h4>
        {playingCharacter && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={stopPreview}>
            Stop
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {CHARACTER_TYPES.map((character) => (
          <motion.button
            key={character.id}
            onClick={() => handlePreviewCharacter(character)}
            disabled={loadingCharacter === character.id || disabled}
            className={`
              relative flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left
              ${playingCharacter === character.id 
                ? "border-primary bg-primary/10" 
                : "border-border/50 hover:border-primary/50 bg-secondary/30 hover:bg-secondary/50"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
          >
            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${character.color} flex items-center justify-center text-white flex-shrink-0`}>
              {loadingCharacter === character.id ? (
                <motion.div
                  className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : playingCharacter === character.id ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                character.icon
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{character.name}</div>
              <div className="text-[10px] text-muted-foreground truncate">{character.description}</div>
            </div>
            {playingCharacter !== character.id && !loadingCharacter && (
              <Play className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            )}
          </motion.button>
        ))}
      </div>
      
      <p className="text-[10px] text-muted-foreground text-center">
        Same voice with different stability & style settings for each character type
      </p>
    </div>
  );
};

export default CharacterVoicePreview;
