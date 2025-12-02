import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PDFUpload from "@/components/converter/PDFUpload";
import TextInput from "@/components/converter/TextInput";
import VoiceSelector, { Voice } from "@/components/converter/VoiceSelector";
import AudioPlayer from "@/components/converter/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Type, Wand2, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Converter = () => {
  const [inputText, setInputText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadsUsed, setUploadsUsed] = useState(0);
  const [fileName, setFileName] = useState("audio-output");
  
  const isPremium = false; // This would come from auth/subscription state
  const uploadsRemaining = 3 - uploadsUsed;

  const handlePDFUpload = (file: File, text: string) => {
    setInputText(text);
    setFileName(file.name.replace(".pdf", ""));
    setUploadsUsed((prev) => prev + 1);
  };

  const handleConvert = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to convert");
      return;
    }

    if (!selectedVoice) {
      toast.error("Please select a voice");
      return;
    }

    setIsGenerating(true);
    
    // Simulate audio generation (in real implementation, this would call a TTS API)
    setTimeout(() => {
      // Create a sample audio URL (in production, this would be the generated audio)
      setAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
      setIsGenerating(false);
      toast.success("Audio generated successfully!");
    }, 3000);
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
              Book to Audio <span className="gradient-text">Converter</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Upload a PDF or paste text, choose your preferred voice, and generate high-quality audio.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Converter;
