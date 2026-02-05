import { useState, useRef } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createWorker } from "tesseract.js";

interface PDFUploadProps {
  onFileSelect: (file: File, text: string) => void;
  uploadsRemaining: number;
  isPremium: boolean;
  characterLimit?: number;
}

const PDFUpload = ({ onFileSelect, uploadsRemaining, isPremium, characterLimit }: PDFUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("Reading document...");
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

  const loadPdfJs = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjsLib);
      };
      script.onerror = () => reject(new Error('Failed to load PDF.js'));
      document.head.appendChild(script);
    });
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const pdfjsLib = await loadPdfJs();
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const totalPages = pdf.numPages;
    let fullText = "";
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n\n";
      
      setExtractionProgress(Math.round((pageNum / totalPages) * 100));
    }
    
    return fullText.trim();
  };

  const performOCR = async (file: File): Promise<string> => {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const totalPages = pdf.numPages;
    let fullText = "";
    
    const worker = await createWorker("eng");
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      setProcessingStatus(`OCR scanning page ${pageNum} of ${totalPages}...`);
      
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({ canvasContext: context, viewport }).promise;
      
      const imageData = canvas.toDataURL("image/png");
      const { data } = await worker.recognize(imageData);
      fullText += data.text + "\n\n";
      
      setExtractionProgress(Math.round((pageNum / totalPages) * 100));
    }
    
    await worker.terminate();
    return fullText.trim();
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

    // Check if extracted text would exceed character limit
    const maxCharacterLimit = characterLimit || Infinity;

    setSelectedFile(file);
    setIsProcessing(true);
    setExtractionProgress(0);
    setProcessingStatus("Reading document...");

    try {
      let extractedText = await extractTextFromPDF(file);
      
      // If text extraction yields little content, try OCR
      if (extractedText.trim().length < 50) {
        setProcessingStatus("Scanned PDF detected, running OCR...");
        setExtractionProgress(0);
        toast.info("Scanned PDF detected. Running OCR (this may take a moment)...");
        extractedText = await performOCR(file);
      }
      
      if (!extractedText.trim()) {
        toast.error("Could not extract text from this PDF.");
        setIsProcessing(false);
        setSelectedFile(null);
        return;
      }

      // Warn if text exceeds character limit
      if (extractedText.length > maxCharacterLimit) {
        toast.warning(`Extracted text (${extractedText.length.toLocaleString()} chars) exceeds your limit of ${maxCharacterLimit.toLocaleString()}. Text will be truncated.`);
        extractedText = extractedText.slice(0, maxCharacterLimit);
      }
      
      onFileSelect(file, extractedText);
      toast.success(`PDF processed! Extracted ${extractedText.length.toLocaleString()} characters.`);
    } catch (error) {
      console.error("PDF extraction error:", error);
      toast.error("Failed to read PDF. Please try a different file.");
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
      setExtractionProgress(0);
    }
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
              <p className="text-muted-foreground mb-2">{processingStatus}</p>
              {extractionProgress > 0 && (
                <div className="w-48 mx-auto">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${extractionProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{extractionProgress}% extracted</p>
                </div>
              )}
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
