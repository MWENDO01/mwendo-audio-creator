import { useState } from "react";
import { Copy, Download, Check, Users, MessageSquare, FileText, Pencil, X, Check as CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TranscriptionWord {
  text: string;
  start: number;
  end: number;
  speaker?: string;
}

interface AudioEvent {
  type: string;
  start: number;
  end: number;
}

export interface TranscriptionData {
  text: string;
  words?: TranscriptionWord[];
  audio_events?: AudioEvent[];
}

interface TranscriptionOutputProps {
  transcription: TranscriptionData | null;
  onTextChange: (text: string) => void;
}

// Speaker colors for visual distinction
const SPEAKER_COLORS = [
  "from-blue-500 to-blue-600",
  "from-purple-500 to-purple-600",
  "from-emerald-500 to-emerald-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
  "from-cyan-500 to-cyan-600",
  "from-pink-500 to-pink-600",
  "from-indigo-500 to-indigo-600",
];

const TranscriptionOutput = ({ transcription, onTextChange }: TranscriptionOutputProps) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("conversation");
  const [speakerNames, setSpeakerNames] = useState<Record<string, string>>({});
  const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const text = transcription?.text || "";
  const words = transcription?.words || [];
  const audioEvents = transcription?.audio_events || [];

  // Get display name for a speaker
  const getDisplayName = (speaker: string) => {
    if (speakerNames[speaker]) return speakerNames[speaker];
    return speaker.replace("speaker_", "Speaker ");
  };

  // Get initials for avatar
  const getInitials = (speaker: string) => {
    const displayName = getDisplayName(speaker);
    if (speakerNames[speaker]) {
      // If custom name, use first letter of first two words
      const parts = displayName.split(" ");
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return displayName.charAt(0).toUpperCase();
    }
    return speaker.replace("speaker_", "S").charAt(0).toUpperCase();
  };

  // Handle speaker rename
  const handleStartEdit = (speaker: string) => {
    setEditingSpeaker(speaker);
    setEditValue(speakerNames[speaker] || "");
  };

  const handleSaveEdit = () => {
    if (editingSpeaker && editValue.trim()) {
      setSpeakerNames(prev => ({
        ...prev,
        [editingSpeaker]: editValue.trim()
      }));
      toast.success(`Renamed to "${editValue.trim()}"`);
    }
    setEditingSpeaker(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingSpeaker(null);
    setEditValue("");
  };

  const handleClearName = (speaker: string) => {
    setSpeakerNames(prev => {
      const newNames = { ...prev };
      delete newNames[speaker];
      return newNames;
    });
    toast.success("Speaker name reset");
  };

  // Group words by speaker for conversation view
  const groupedBySpeaker = (() => {
    if (!words.length) return [];

    const groups: { speaker: string; text: string; start: number; end: number }[] = [];
    let currentSpeaker = words[0]?.speaker || "Speaker";
    let currentText = "";
    let currentStart = words[0]?.start || 0;
    let currentEnd = words[0]?.end || 0;

    words.forEach((word, index) => {
      const speaker = word.speaker || "Speaker";
      
      if (speaker !== currentSpeaker) {
        // Save current group
        if (currentText.trim()) {
          groups.push({
            speaker: currentSpeaker,
            text: currentText.trim(),
            start: currentStart,
            end: currentEnd,
          });
        }
        // Start new group
        currentSpeaker = speaker;
        currentText = word.text;
        currentStart = word.start;
        currentEnd = word.end;
      } else {
        currentText += " " + word.text;
        currentEnd = word.end;
      }

      // Handle last word
      if (index === words.length - 1 && currentText.trim()) {
        groups.push({
          speaker: currentSpeaker,
          text: currentText.trim(),
          start: currentStart,
          end: currentEnd,
        });
      }
    });

    return groups;
  })();

  // Get unique speakers
  const speakers = [...new Set(words.map(w => w.speaker).filter(Boolean))];
  const hasSpeakers = speakers.length > 1;

  // Create speaker color map
  const speakerColorMap = new Map<string, string>();
  speakers.forEach((speaker, index) => {
    speakerColorMap.set(speaker!, SPEAKER_COLORS[index % SPEAKER_COLORS.length]);
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopy = async () => {
    try {
      let copyText = text;
      
      // If we have speaker data, format it nicely for copying with custom names
      if (hasSpeakers && groupedBySpeaker.length > 0) {
        copyText = groupedBySpeaker
          .map(g => `${getDisplayName(g.speaker)}: ${g.text}`)
          .join("\n\n");
      }
      
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      toast.success("Text copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy text");
    }
  };

  const handleDownload = () => {
    let downloadText = text;
    
    // If we have speaker data, format it nicely for download with custom names
    if (hasSpeakers && groupedBySpeaker.length > 0) {
      downloadText = groupedBySpeaker
        .map(g => `[${formatTime(g.start)}] ${getDisplayName(g.speaker)}: ${g.text}`)
        .join("\n\n");
    }
    
    const blob = new Blob([downloadText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcription.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Transcription downloaded!");
  };

  if (!text) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <p className="text-muted-foreground">
          Your transcribed text will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">Transcription Result</h3>
          {hasSpeakers && (
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full hover:bg-secondary transition-colors">
                  <Users className="w-3 h-3" />
                  <span>{speakers.length} speakers</span>
                  <Pencil className="w-3 h-3 ml-1" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3" align="start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Rename Speakers</h4>
                    <span className="text-xs text-muted-foreground">Click to edit</span>
                  </div>
                  <div className="space-y-2">
                    {speakers.map((speaker) => (
                      <div key={speaker} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${speakerColorMap.get(speaker!) || SPEAKER_COLORS[0]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {getInitials(speaker!)}
                        </div>
                        {editingSpeaker === speaker ? (
                          <div className="flex-1 flex items-center gap-1">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              placeholder="Enter name..."
                              className="h-7 text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveEdit();
                                if (e.key === "Escape") handleCancelEdit();
                              }}
                            />
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveEdit}>
                              <CheckIcon className="w-3 h-3 text-green-500" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancelEdit}>
                              <X className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-between">
                            <button
                              onClick={() => handleStartEdit(speaker!)}
                              className="text-sm hover:text-primary transition-colors text-left"
                            >
                              {getDisplayName(speaker!)}
                            </button>
                            <div className="flex items-center gap-1">
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleStartEdit(speaker!)}>
                                <Pencil className="w-3 h-3" />
                              </Button>
                              {speakerNames[speaker!] && (
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleClearName(speaker!)}>
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
          {audioEvents.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
              <span>🎵</span>
              <span>{audioEvents.length} events</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="w-4 h-4 mr-1" />
            ) : (
              <Copy className="w-4 h-4 mr-1" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {hasSpeakers ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="conversation" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Conversation
            </TabsTrigger>
            <TabsTrigger value="plain" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Plain Text
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="conversation" className="mt-4">
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {groupedBySpeaker.map((group, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${speakerColorMap.get(group.speaker) || SPEAKER_COLORS[0]} flex items-center justify-center text-white text-xs font-bold`}>
                      {getInitials(group.speaker)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {getDisplayName(group.speaker)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(group.start)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {group.text}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Audio Events */}
              {audioEvents.length > 0 && (
                <div className="pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Audio Events Detected:</p>
                  <div className="flex flex-wrap gap-2">
                    {audioEvents.map((event, index) => (
                      <span key={index} className="text-xs bg-secondary/50 px-2 py-1 rounded-full">
                        {event.type === "laughter" && "😄"}
                        {event.type === "applause" && "👏"}
                        {event.type === "music" && "🎵"}
                        {event.type === "speech" && "🗣️"}
                        {!["laughter", "applause", "music", "speech"].includes(event.type) && "🔊"}
                        {" "}{event.type} ({formatTime(event.start)})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="plain" className="mt-4">
            <Textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              className="min-h-[300px] resize-none bg-secondary/30"
              placeholder="Transcribed text..."
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          className="min-h-[300px] resize-none bg-secondary/30"
          placeholder="Transcribed text..."
        />
      )}

      <p className="text-xs text-muted-foreground">
        {text.split(/\s+/).filter(Boolean).length} words • {text.length} characters
        {hasSpeakers && ` • ${groupedBySpeaker.length} segments`}
      </p>
    </div>
  );
};

export default TranscriptionOutput;
