import { useState } from "react";
import { FileText, Copy, Check, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { CharacterLimitIndicator, PLAN_LIMITS } from "./CharacterLimitIndicator";

interface TextPreviewProps {
  text: string;
  fileName: string;
  onTextChange: (text: string) => void;
  onFileNameChange: (name: string) => void;
  onClear: () => void;
}

const TextPreview = ({ 
  text, 
  fileName, 
  onTextChange, 
  onFileNameChange, 
  onClear 
}: TextPreviewProps) => {
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(fileName);
  const { subscription } = useAuth();
  const plan = subscription.plan;
  const characterLimit = PLAN_LIMITS[plan];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Text copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy text");
    }
  };

  const handleSaveName = () => {
    if (editName.trim()) {
      onFileNameChange(editName.trim());
    }
    setIsEditingName(false);
  };

  const handleTextChange = (newText: string) => {
    onTextChange(newText.slice(0, characterLimit));
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const estimatedDuration = Math.ceil(wordCount / 150); // ~150 words per minute

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          
          {isEditingName ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") {
                    setEditName(fileName);
                    setIsEditingName(false);
                  }
                }}
              />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveName}>
                <Check className="w-4 h-4 text-green-500" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <div className="min-w-0">
                <p className="font-medium truncate">{fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {wordCount.toLocaleString()} words • ~{estimatedDuration} min
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 flex-shrink-0" 
                onClick={() => {
                  setEditName(fileName);
                  setIsEditingName(true);
                }}
              >
                <Pencil className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClear}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Editable Text Area */}
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="min-h-[200px] max-h-[400px] resize-y bg-background/50 border-border/50"
          placeholder="Extracted text will appear here..."
        />
      </div>

      {/* Character Limit Indicator */}
      <CharacterLimitIndicator 
        currentCount={text.length} 
        plan={plan} 
      />

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground text-center">
        Review and edit the extracted text before converting to audio
      </p>
    </motion.div>
  );
};

export default TextPreview;