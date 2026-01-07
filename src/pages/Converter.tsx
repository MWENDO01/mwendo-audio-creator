import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PDFUpload from "@/components/converter/PDFUpload";
import TextInput from "@/components/converter/TextInput";
import VoiceSelector, { Voice } from "@/components/converter/VoiceSelector";
import AudioPlayer from "@/components/converter/AudioPlayer";
import AudioUpload from "@/components/converter/AudioUpload";
import TranscriptionOutput from "@/components/converter/TranscriptionOutput";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Type, Wand2, Crown, Mic } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAudioStorage } from "@/hooks/useAudioStorage";
import { supabase } from "@/integrations/supabase/client";

const Converter = () => {
  const [inputText, setInputText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadsUsed, setUploadsUsed] = useState(0);
  const [fileName, setFileName] = useState("audio-output");
  const [transcribedText, setTranscribedText] = useState("");
  const [activeMainTab, setActiveMainTab] = useState("text-to-speech");
  
  const { user, subscription } = useAuth();
  const { uploadAudio } = useAudioStorage();
  const navigate = useNavigate();
  
  const isPremium = subscription.subscribed;
  const uploadsRemaining = 3 - uploadsUsed;

  const handlePDFUpload = (file: File, text: string) => {
    setInputText(text);
    setFileName(file.name.replace(".pdf", ""));
    setUploadsUsed((prev) => prev + 1);
  };

  const handleConvert = async () => {
    if (!user) {
      toast.error("Please sign in to convert audio");
      navigate("/auth");
      return;
    }

    if (!inputText.trim()) {
      toast.error("Please enter some text to convert");
      return;
    }

    if (!selectedVoice) {
      toast.error("Please select a voice");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Call ElevenLabs TTS edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            text: inputText, 
            voiceId: selectedVoice.id 
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      
      // Upload to storage bucket
      const publicUrl = await uploadAudio(audioBlob, fileName);
      
      // Save conversion record to database
      const { error: dbError } = await supabase
        .from("audio_conversions")
        .insert({
          user_id: user.id,
          name: fileName,
          original_filename: fileName + ".pdf",
          voice_id: selectedVoice.id,
          voice_name: selectedVoice.name,
          character_count: inputText.length,
          status: "completed",
          audio_url: publicUrl,
          duration_seconds: Math.ceil(inputText.length / 15), // Rough estimate
          file_size_bytes: audioBlob.size,
        });

      if (dbError) {
        throw dbError;
      }
      
      setAudioUrl(publicUrl);
      toast.success("Audio generated and saved successfully!");
    } catch (error) {
      console.error("Error generating audio:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate audio. Please try again.");
    } finally {
      setIsGenerating(false);
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
                    <TabsList className="w-full grid grid-cols-2 bg-secondary/50">
                      <TabsTrigger value="pdf" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <FileText className="w-4 h-4 mr-2" />
                        PDF Upload
                      </TabsTrigger>
                      <TabsTrigger value="text" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Type className="w-4 h-4 mr-2" />
                        Text Input
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pdf" className="mt-6">
                      <PDFUpload
                        onFileSelect={handlePDFUpload}
                        uploadsRemaining={uploadsRemaining}
                        isPremium={isPremium}
                      />
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
                  />

                  {/* Convert Button */}
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

                  {/* Audio Player */}
                  <AudioPlayer
                    audioUrl={audioUrl}
                    fileName={fileName}
                    isGenerating={isGenerating}
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
                    <AudioUpload onTranscriptionComplete={setTranscribedText} />
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
                    text={transcribedText} 
                    onTextChange={setTranscribedText} 
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
