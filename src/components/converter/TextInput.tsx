import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CharacterLimitIndicator, PLAN_LIMITS } from "./CharacterLimitIndicator";

interface TextInputProps {
  value: string;
  onChange: (text: string) => void;
}

const TextInput = ({ value, onChange }: TextInputProps) => {
  const { subscription } = useAuth();
  const plan = subscription.plan;
  const characterLimit = PLAN_LIMITS[plan];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, characterLimit))}
          placeholder="Paste or type your text here to convert to audio..."
          className="min-h-[200px] resize-none bg-secondary/50 border-border focus:border-primary/50 rounded-xl text-base pb-4"
        />
      </div>

      {/* Character Limit Indicator */}
      <CharacterLimitIndicator 
        currentCount={value.length} 
        plan={plan} 
      />

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange("")}
          disabled={!value}
          className="text-muted-foreground"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            const text = await navigator.clipboard.readText();
            onChange(text.slice(0, characterLimit));
          }}
          className="text-muted-foreground"
        >
          <FileText className="w-4 h-4 mr-1" />
          Paste from Clipboard
        </Button>
      </div>
    </div>
  );
};

export default TextInput;
