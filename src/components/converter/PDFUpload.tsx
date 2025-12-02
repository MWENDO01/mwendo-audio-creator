import { useState, useRef } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface PDFUploadProps {
  onFileSelect: (file: File, text: string) => void;
  uploadsRemaining: number;
  isPremium: boolean;
}

const PDFUpload = ({ onFileSelect, uploadsRemaining, isPremium }: PDFUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.includes("pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    if (!isPremium && uploadsRemaining <= 0) {
      toast.error("You've reached your free upload limit. Upgrade to continue!");
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    // Simulate PDF text extraction (in real implementation, this would use a PDF parser)
    setTimeout(() => {
      const sampleText = `This is extracted text from your PDF "${file.name}". In a full implementation, this would contain the actual content extracted from your uploaded document using a PDF parsing library.`;
      onFileSelect(file, sampleText);
      setIsProcessing(false);
      toast.success("PDF uploaded successfully!");
    }, 1500);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Limit Indicator */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20"
        >
          <AlertCircle className="w-4 h-4 text-accent" />
          <span className="text-sm">
            <span className="font-semibold">{uploadsRemaining}</span> free uploads remaining
          </span>
        </motion.div>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300
          ${isDragging 
            ? "border-primary bg-primary/10" 
            : "border-border hover:border-primary/50 hover:bg-secondary/50"
          }
          ${selectedFile ? "border-primary bg-primary/5" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-muted-foreground">Processing PDF...</p>
            </motion.div>
          ) : selectedFile ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="font-medium mb-1">Drop your PDF here</p>
              <p className="text-sm text-muted-foreground">or click to browse (max 10MB)</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PDFUpload;
