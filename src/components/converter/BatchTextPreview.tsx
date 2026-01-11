import { useState } from "react";
import { FileText, ChevronDown, ChevronRight, X, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CharacterLimitIndicator } from "./CharacterLimitIndicator";

interface ProcessedFile {
  id: string;
  fileName: string;
  text: string;
  characterCount: number;
}

interface BatchTextPreviewProps {
  files: ProcessedFile[];
  onFilesChange: (files: ProcessedFile[]) => void;
  onClear: () => void;
  isPremium: boolean;
}

const BatchTextPreview = ({ files, onFilesChange, onClear, isPremium }: BatchTextPreviewProps) => {
  const [expandedFile, setExpandedFile] = useState<string | null>(files[0]?.id || null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");

  const totalCharacters = files.reduce((sum, f) => sum + f.characterCount, 0);

  const handleTextChange = (id: string, newText: string) => {
    onFilesChange(files.map(f => 
      f.id === id ? { ...f, text: newText, characterCount: newText.length } : f
    ));
  };

  const handleRemoveFile = (id: string) => {
    const newFiles = files.filter(f => f.id !== id);
    onFilesChange(newFiles);
    if (expandedFile === id && newFiles.length > 0) {
      setExpandedFile(newFiles[0].id);
    }
  };

  const startEditingName = (id: string, currentName: string) => {
    setEditingName(id);
    setTempName(currentName);
  };

  const saveName = (id: string) => {
    if (tempName.trim()) {
      onFilesChange(files.map(f => 
        f.id === id ? { ...f, fileName: tempName.trim() } : f
      ));
    }
    setEditingName(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{files.length} Documents Ready</p>
            <p className="text-sm text-muted-foreground">
              {totalCharacters.toLocaleString()} total characters
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onClear}>
          <X className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Character Limit for total */}
      <CharacterLimitIndicator 
        currentCount={totalCharacters} 
        plan={isPremium ? "pro" : "free"} 
      />

      {/* File Accordion */}
      <ScrollArea className="h-[350px] pr-4">
        <div className="space-y-2">
          {files.map((file) => (
            <motion.div
              key={file.id}
              layout
              className="border border-border rounded-lg overflow-hidden bg-secondary/30"
            >
              {/* File Header */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => setExpandedFile(expandedFile === file.id ? null : file.id)}
              >
                <div className="flex-shrink-0">
                  {expandedFile === file.id ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                {editingName === file.id ? (
                  <div className="flex-1 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="h-7 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveName(file.id);
                        if (e.key === "Escape") setEditingName(null);
                      }}
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => saveName(file.id)}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="font-medium text-sm truncate">{file.fileName}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingName(file.id, file.fileName);
                      }}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {file.characterCount.toLocaleString()} chars
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(file.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedFile === file.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-3">
                      <Textarea
                        value={file.text}
                        onChange={(e) => handleTextChange(file.id, e.target.value)}
                        className="min-h-[150px] text-sm resize-none"
                        placeholder="Edit extracted text..."
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default BatchTextPreview;
