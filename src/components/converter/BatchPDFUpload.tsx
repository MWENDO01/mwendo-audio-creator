import { useState, useRef } from "react";
import { Upload, FileText, X, AlertCircle, CheckCircle2, Loader2, Files } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createWorker } from "tesseract.js";
import { Progress } from "@/components/ui/progress";

interface PDFFile {
  file: File;
  id: string;
  status: "pending" | "processing" | "completed" | "error";
  text?: string;
  error?: string;
  progress: number;
}

interface BatchPDFUploadProps {
  onFilesProcessed: (files: { file: File; text: string }[]) => void;
  uploadsRemaining: number;
  isPremium: boolean;
  characterLimit?: number;
}

const BatchPDFUpload = ({ onFilesProcessed, uploadsRemaining, isPremium, characterLimit }: BatchPDFUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
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
    
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.includes("pdf"));
    if (files.length > 0) {
      addFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      addFiles(files);
    }
  };

  const addFiles = (files: File[]) => {
    const maxFiles = isPremium ? 20 : Math.min(uploadsRemaining, 3);
    const currentCount = pdfFiles.length;
    const remainingSlots = maxFiles - currentCount;

    if (remainingSlots <= 0) {
      toast.error(isPremium ? "Maximum 20 files per batch" : "You've reached your upload limit");
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    const oversized = filesToAdd.filter(f => f.size > 10 * 1024 * 1024);
    
    if (oversized.length > 0) {
      toast.error(`${oversized.length} file(s) exceed 10MB limit and were skipped`);
    }

    const validFiles = filesToAdd
      .filter(f => f.size <= 10 * 1024 * 1024)
      .map(file => ({
        file,
        id: crypto.randomUUID(),
        status: "pending" as const,
        progress: 0,
      }));

    if (validFiles.length === 0) return;

    setPdfFiles(prev => [...prev, ...validFiles]);
    toast.success(`Added ${validFiles.length} PDF(s) to queue`);
  };

  const removeFile = (id: string) => {
    setPdfFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setPdfFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const loadPdfJs = (): Promise<any> => {
    return new Promise((resolve, reject) => {
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

  const extractTextFromPDF = async (file: File, onProgress: (p: number) => void): Promise<string> => {
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
      
      onProgress(Math.round((pageNum / totalPages) * 100));
    }
    
    return fullText.trim();
  };

  const performOCR = async (file: File, onProgress: (p: number) => void): Promise<string> => {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const totalPages = pdf.numPages;
    let fullText = "";
    
    const worker = await createWorker("eng");
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
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
      
      onProgress(Math.round((pageNum / totalPages) * 100));
    }
    
    await worker.terminate();
    return fullText.trim();
  };

  const processAllFiles = async () => {
    if (pdfFiles.length === 0) return;

    setIsProcessingBatch(true);
    setOverallProgress(0);

    const results: { file: File; text: string }[] = [];
    const totalFiles = pdfFiles.length;

    for (let i = 0; i < pdfFiles.length; i++) {
      const pdfFile = pdfFiles[i];
      
      setPdfFiles(prev => prev.map(f => 
        f.id === pdfFile.id ? { ...f, status: "processing" as const, progress: 0 } : f
      ));

      try {
        let extractedText = await extractTextFromPDF(pdfFile.file, (progress) => {
          setPdfFiles(prev => prev.map(f => 
            f.id === pdfFile.id ? { ...f, progress } : f
          ));
        });

        // If text extraction yields little content, try OCR
        if (extractedText.trim().length < 50) {
          extractedText = await performOCR(pdfFile.file, (progress) => {
            setPdfFiles(prev => prev.map(f => 
              f.id === pdfFile.id ? { ...f, progress } : f
            ));
          });
        }

        if (extractedText.trim()) {
          results.push({ file: pdfFile.file, text: extractedText });
          setPdfFiles(prev => prev.map(f => 
            f.id === pdfFile.id ? { ...f, status: "completed" as const, text: extractedText, progress: 100 } : f
          ));
        } else {
          setPdfFiles(prev => prev.map(f => 
            f.id === pdfFile.id ? { ...f, status: "error" as const, error: "No text found", progress: 0 } : f
          ));
        }
      } catch (error) {
        console.error("PDF extraction error:", error);
        setPdfFiles(prev => prev.map(f => 
          f.id === pdfFile.id ? { ...f, status: "error" as const, error: "Failed to process", progress: 0 } : f
        ));
      }

      setOverallProgress(Math.round(((i + 1) / totalFiles) * 100));
    }

    setIsProcessingBatch(false);

    if (results.length > 0) {
      onFilesProcessed(results);
      toast.success(`Successfully processed ${results.length} of ${totalFiles} PDFs`);
    } else {
      toast.error("Failed to process any PDFs");
    }
  };

  const completedCount = pdfFiles.filter(f => f.status === "completed").length;
  const errorCount = pdfFiles.filter(f => f.status === "error").length;

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
        onClick={() => !isProcessingBatch && fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300
          ${isDragging 
            ? "border-primary bg-primary/10" 
            : "border-border hover:border-primary/50 hover:bg-secondary/50"
          }
          ${isProcessingBatch ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="py-2">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-secondary flex items-center justify-center">
            <Files className="w-7 h-7 text-primary" />
          </div>
          <p className="font-medium mb-1">Drop multiple PDFs here</p>
          <p className="text-sm text-muted-foreground">
            or click to browse (max 10MB each, {isPremium ? "20" : "3"} files)
          </p>
        </div>
      </div>

      {/* File List */}
      <AnimatePresence>
        {pdfFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {pdfFiles.length} file(s) queued
                {completedCount > 0 && (
                  <span className="text-green-500 ml-2">({completedCount} completed)</span>
                )}
                {errorCount > 0 && (
                  <span className="text-red-500 ml-2">({errorCount} failed)</span>
                )}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                disabled={isProcessingBatch}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            </div>

            {/* File Items */}
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
              {pdfFiles.map((pdfFile) => (
                <motion.div
                  key={pdfFile.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    {pdfFile.status === "processing" ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : pdfFile.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : pdfFile.status === "error" ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{pdfFile.file.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {(pdfFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      {pdfFile.status === "processing" && (
                        <span className="text-xs text-primary">{pdfFile.progress}%</span>
                      )}
                      {pdfFile.status === "completed" && pdfFile.text && (
                        <span className="text-xs text-green-500">
                          {pdfFile.text.length.toLocaleString()} chars
                        </span>
                      )}
                      {pdfFile.status === "error" && (
                        <span className="text-xs text-red-500">{pdfFile.error}</span>
                      )}
                    </div>
                  </div>

                  {pdfFile.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(pdfFile.id);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Overall Progress */}
            {isProcessingBatch && (
              <div className="space-y-2">
                <Progress value={overallProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Processing batch: {overallProgress}% complete
                </p>
              </div>
            )}

            {/* Process Button */}
            <Button
              variant="gradient"
              className="w-full"
              onClick={processAllFiles}
              disabled={isProcessingBatch || pdfFiles.filter(f => f.status === "pending").length === 0}
            >
              {isProcessingBatch ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing {pdfFiles.length} files...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Process {pdfFiles.filter(f => f.status === "pending").length} PDF(s)
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BatchPDFUpload;
