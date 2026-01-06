import { useState } from "react";
import { Copy, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface TranscriptionOutputProps {
  text: string;
  onTextChange: (text: string) => void;
}

const TranscriptionOutput = ({ text, onTextChange }: TranscriptionOutputProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Text copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy text");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" });
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
        <h3 className="font-semibold">Transcription Result</h3>
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

      <Textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        className="min-h-[300px] resize-none bg-secondary/30"
        placeholder="Transcribed text..."
      />

      <p className="text-xs text-muted-foreground">
        {text.split(/\s+/).filter(Boolean).length} words • {text.length} characters
      </p>
    </div>
  );
};

export default TranscriptionOutput;
