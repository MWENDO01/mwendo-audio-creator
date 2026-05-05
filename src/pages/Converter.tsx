import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PDFUpload from "@/components/converter/PDFUpload";
import BatchPDFUpload from "@/components/converter/BatchPDFUpload";
import BatchTextPreview from "@/components/converter/BatchTextPreview";
import TextInput from "@/components/converter/TextInput";
import TextPreview from "@/components/converter/TextPreview";
import VoiceSelector, { Voice } from "@/components/converter/VoiceSelector";
import AudioPlayer from "@/components/converter/AudioPlayer";
import AudioUpload from "@/components/converter/AudioUpload";
import TranscriptionOutput, { TranscriptionData } from "@/components/converter/TranscriptionOutput";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Type, Wand2, Crown, Mic, Files, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAudioStorage } from "@/hooks/useAudioStorage";
import { supabase } from "@/integrations/supabase/client";
import { getSignedAudioUrl } from "@/lib/audioUrl";
import { Progress } from "@/components/ui/progress";

interface BatchFile {
  id: string;
  fileName: string;
  text: string;
  characterCount: number;
}

const Converter = () => {
  const [inputText, setInputText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadsUsed, setUploadsUsed] = useState(0);
  const [fileName, setFileName] = useState("audio-output");
  const [hasPdfExtracted, setHasPdfExtracted] = useState(false);
  const [transcriptionData, setTranscriptionData] = useState<TranscriptionData | null>(null);
  const [activeMainTab, setActiveMainTab] = useState("text-to-speech");
  const [pdfMode, setPdfMode] = useState<"single" | "batch">("single");
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [multiVoiceEnabled, setMultiVoiceEnabled] = useState(true);
  
  const { user, subscription } = useAuth();
  const { uploadAudio } = useAudioStorage();
  const navigate = useNavigate();
  
  const isPremium = subscription.subscribed;
  const characterLimit = subscription.characterLimit;
  const pdfLimit = subscription.pdfLimit;
  const uploadsRemaining = pdfLimit ? Math.max(pdfLimit - uploadsUsed, 0) : Infinity;

  const handlePDFUpload = async (file: File, text: string) => {
    const pdfName = file.name.replace(".pdf", "");
    setInputText(text);
    setFileName(pdfName);
    setHasPdfExtracted(true);
    setUploadsUsed((prev) => prev + 1);
    toast.success("PDF text extracted! Review and edit before converting.");
  };

  const handleClearPreview = () => {
    setInputText("");
    setFileName("audio-output");
    setHasPdfExtracted(false);
    setAudioUrl(null);
    setBatchFiles([]);
  };

  const handleBatchFilesProcessed = (files: { file: File; text: string }[]) => {
    const processedFiles: BatchFile[] = files.map((f) => ({
      id: crypto.randomUUID(),
      fileName: f.file.name.replace(".pdf", ""),
      text: f.text,
      characterCount: f.text.length,
    }));
    setBatchFiles(processedFiles);
    setUploadsUsed((prev) => prev + files.length);
  };

  const handleBatchConvert = async () => {
    if (!user) {
      toast.error("Please sign in to convert audio");
      navigate("/auth");
      return;
    }

    if (!selectedVoice) {
      toast.error("Please select a voice first");
      return;
    }

    if (batchFiles.length === 0) {
      toast.error("No files to convert");
      return;
    }

    setIsBatchGenerating(true);
    setBatchProgress({ current: 0, total: batchFiles.length });

    let successCount = 0;

    for (let i = 0; i < batchFiles.length; i++) {
      const file = batchFiles[i];
      setBatchProgress({ current: i + 1, total: batchFiles.length });

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) continue;

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
              text: file.text,
              voiceId: selectedVoice.id,
              language: selectedLanguage,
              enableMultiVoice: multiVoiceEnabled,
            }),
          }
        );

        if (!response.ok) {
          console.error(`Failed to convert ${file.fileName}`);
          continue;
        }

        const audioBlob = await response.blob();
        const storagePath = await uploadAudio(audioBlob, file.fileName);

        await supabase.from("audio_conversions").insert({
          user_id: user.id,
          name: file.fileName,
          original_filename: file.fileName + ".pdf",
          voice_id: selectedVoice.id,
          voice_name: selectedVoice.name,
          character_count: file.text.length,
          status: "completed",
          audio_url: storagePath,
          duration_seconds: Math.ceil(file.text.length / 15),
          file_size_bytes: audioBlob.size,
        });

        successCount++;
      } catch (error) {
        console.error(`Error converting ${file.fileName}:`, error);
      }
    }

    setIsBatchGenerating(false);
    setBatchProgress({ current: 0, total: 0 });

    if (successCount > 0) {
      toast.success(`Successfully converted ${successCount} of ${batchFiles.length} files!`);
      setBatchFiles([]);
    } else {
      toast.error("Failed to convert any files");
    }
  };

  const generateAudio = async (text: string, name: string) => {
    if (!user) {
      toast.error("Please sign in to convert audio");
      navigate("/auth");
      return;
    }

    if (!selectedVoice) {
      toast.error("Please select a voice first");
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to convert audio");
        navigate("/auth");
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
            text: text, 
            voiceId: selectedVoice.id,
            language: selectedLanguage,
            enableMultiVoice: multiVoiceEnabled,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const storagePath = await uploadAudio(audioBlob, name);
      
      const { error: dbError } = await supabase
        .from("audio_conversions")
        .insert({
          user_id: user.id,
          name: name,
          original_filename: name + ".pdf",
          voice_id: selectedVoice.id,
          voice_name: selectedVoice.name,
          character_count: text.length,
          status: "completed",
          audio_url: storagePath,
          duration_seconds: Math.ceil(text.length / 15),
          file_size_bytes: audioBlob.size,
        });

      if (dbError) {
        throw dbError;
      }
      
      const signed = await getSignedAudioUrl(storagePath);
      setAudioPath(storagePath);
      setAudioUrl(signed);
      toast.success("Audio generated and saved successfully!");
    } catch (error) {
      console.error("Error generating audio:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate audio. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConvert = async () => {
    // Enforce character limit
    if (inputText.length > characterLimit) {
      toast.error(`Text exceeds your plan limit of ${characterLimit.toLocaleString()} characters. Please upgrade or reduce text.`);
      return;
    }
    await generateAudio(inputText, fileName);
  };

  const handleRename = async (newName: string) => {
    setFileName(newName);
    
    // Update in database if audio exists
    if (audioPath && user) {
      try {
        const { error } = await supabase
          .from("audio_conversions")
          .update({ name: newName })
          .eq("audio_url", audioPath)
          .eq("user_id", user.id);
          
        if (error) throw error;
        toast.success("Audio renamed successfully!");
      } catch (error) {
        console.error("Error renaming audio:", error);
        toast.error("Failed to rename audio");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Audio <span className="gradient-text">Converter</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Convert text to speech or transcribe audio to text with AI-powered tools.
            </p>
          </motion.div>

          {/* Main Mode Tabs */}
          <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="max-w-6xl mx-auto">
            <TabsList className="w-full grid grid-cols-2 mb-8 bg-secondary/50">
              <TabsTrigger value="text-to-speech" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Wand2 className="w-4 h-4 mr-2" />
                Text to Speech
              </TabsTrigger>
              <TabsTrigger value="transcribe" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Mic className="w-4 h-4 mr-2" />
                Transcribe Audio
              </TabsTrigger>
            </TabsList>

            {/* Text to Speech Tab */}
            <TabsContent value="text-to-speech">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  <Tabs defaultValue="pdf" className="w-full">
                    <TabsList className="w-full grid grid-cols-3 bg-secondary/50">
                      <TabsTrigger value="pdf" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <FileText className="w-4 h-4 mr-2" />
                        Single PDF
                      </TabsTrigger>
                      <TabsTrigger value="batch" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Files className="w-4 h-4 mr-2" />
                        Batch PDF
                      </TabsTrigger>
                      <TabsTrigger value="text" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Type className="w-4 h-4 mr-2" />
                        Text Input
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pdf" className="mt-6 space-y-4">
                      <AnimatePresence mode="wait">
                        {hasPdfExtracted ? (
                          <TextPreview
                            key="preview"
                            text={inputText}
                            fileName={fileName}
                            onTextChange={setInputText}
                            onFileNameChange={setFileName}
                            onClear={handleClearPreview}
                          />
                        ) : (
                          <motion.div
                            key="upload"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <PDFUpload
                              onFileSelect={handlePDFUpload}
                              uploadsRemaining={uploadsRemaining === Infinity ? 999 : uploadsRemaining}
                              isPremium={isPremium}
                              characterLimit={characterLimit}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </TabsContent>

                    <TabsContent value="batch" className="mt-6 space-y-4">
                      <AnimatePresence mode="wait">
                        {batchFiles.length > 0 ? (
                          <BatchTextPreview
                            key="batch-preview"
                            files={batchFiles}
                            onFilesChange={setBatchFiles}
                            onClear={handleClearPreview}
                            isPremium={isPremium}
                          />
                        ) : (
                          <motion.div
                            key="batch-upload"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <BatchPDFUpload
                              onFilesProcessed={handleBatchFilesProcessed}
                              uploadsRemaining={uploadsRemaining === Infinity ? 999 : uploadsRemaining}
                              isPremium={isPremium}
                              characterLimit={characterLimit}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </TabsContent>
                    
                    <TabsContent value="text" className="mt-6">
                      <TextInput value={inputText} onChange={setInputText} />
                    </TabsContent>
                  </Tabs>

                  {/* Upgrade Banner (for free users) */}
                  {!isPremium && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass rounded-xl p-4 border border-accent/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                          <Crown className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Upgrade to Premium</p>
                          <p className="text-sm text-muted-foreground">
                            Unlimited uploads, premium voices & faster processing
                          </p>
                        </div>
                        <Link to="/pricing">
                          <Button variant="gradient" size="sm">
                            Upgrade
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Right Column - Voice Selection & Output */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Voice Selector */}
                  <VoiceSelector
                    selectedVoice={selectedVoice}
                    onVoiceSelect={setSelectedVoice}
                    isPremium={isPremium}
                    selectedLanguage={selectedLanguage}
                    onLanguageSelect={setSelectedLanguage}
                    multiVoiceEnabled={multiVoiceEnabled}
                    onMultiVoiceToggle={setMultiVoiceEnabled}
                  />

                  {/* Convert Button */}
                  {batchFiles.length > 0 ? (
                    <div className="space-y-3">
                      {isBatchGenerating && (
                        <div className="space-y-2">
                          <Progress value={(batchProgress.current / batchProgress.total) * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground text-center">
                            Converting {batchProgress.current} of {batchProgress.total} files...
                          </p>
                        </div>
                      )}
                      <Button
                        variant="gradient"
                        size="xl"
                        className="w-full"
                        onClick={handleBatchConvert}
                        disabled={isBatchGenerating || !selectedVoice}
                      >
                        {isBatchGenerating ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Converting Batch...
                          </>
                        ) : (
                          <>
                            <Files className="w-5 h-5 mr-2" />
                            Convert {batchFiles.length} Files
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="gradient"
                      size="xl"
                      className="w-full"
                      onClick={handleConvert}
                      disabled={isGenerating || !inputText.trim() || !selectedVoice}
                    >
                      <Wand2 className="w-5 h-5 mr-2" />
                      {isGenerating ? "Generating..." : "Convert to Audio"}
                    </Button>
                  )}

                  {/* Audio Player */}
                  <AudioPlayer
                    audioUrl={audioUrl}
                    fileName={fileName}
                    isGenerating={isGenerating}
                    onRename={handleRename}
                  />
                </motion.div>
              </div>
            </TabsContent>

            {/* Transcribe Tab */}
            <TabsContent value="transcribe">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Audio Upload */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  <div className="glass rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Mic className="w-5 h-5 text-primary" />
                      Upload Audio File
                    </h3>
                    <AudioUpload onTranscriptionComplete={setTranscriptionData} />
                  </div>

                  {/* Upgrade Banner (for free users) */}
                  {!isPremium && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass rounded-xl p-4 border border-accent/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                          <Crown className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Upgrade to Premium</p>
                          <p className="text-sm text-muted-foreground">
                            Unlimited transcriptions & speaker diarization
                          </p>
                        </div>
                        <Link to="/pricing">
                          <Button variant="gradient" size="sm">
                            Upgrade
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Right Column - Transcription Output */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <TranscriptionOutput 
                    transcription={transcriptionData} 
                    onTextChange={(text) => setTranscriptionData(prev => prev ? { ...prev, text } : { text })} 
                  />
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Converter;
