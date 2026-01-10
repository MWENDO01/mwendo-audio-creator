import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Pre-process text for more natural speech with proper pauses and emphasis
function preprocessTextForNaturalSpeech(text: string): string {
  let processed = text;
  
  // Normalize whitespace
  processed = processed.replace(/\s+/g, ' ').trim();
  
  // Add SSML-like pauses for better rhythm (ElevenLabs interprets these naturally)
  // Add slight pause after commas
  processed = processed.replace(/,\s*/g, ', ');
  
  // Add longer pause after periods, question marks, exclamation marks
  processed = processed.replace(/\.\s+/g, '. ');
  processed = processed.replace(/\?\s+/g, '? ');
  processed = processed.replace(/!\s+/g, '! ');
  
  // Add pause after colons and semicolons
  processed = processed.replace(/:\s*/g, ': ');
  processed = processed.replace(/;\s*/g, '; ');
  
  // Handle ellipsis for dramatic pause
  processed = processed.replace(/\.{3,}/g, '... ');
  processed = processed.replace(/…/g, '... ');
  
  // Handle dashes for emphasis pauses
  processed = processed.replace(/\s*[-–—]\s*/g, ' — ');
  
  // Handle parentheses - add subtle pauses
  processed = processed.replace(/\(\s*/g, ' (');
  processed = processed.replace(/\s*\)/g, ') ');
  
  // Handle quotes for dialogue emphasis
  processed = processed.replace(/"\s*/g, '"');
  processed = processed.replace(/\s*"/g, '"');
  
  // Add pause between paragraphs
  processed = processed.replace(/\n\n+/g, '\n\n');
  processed = processed.replace(/\n/g, '. ');
  
  // Handle common abbreviations to prevent awkward pronunciation
  processed = processed.replace(/\betc\./gi, 'etcetera');
  processed = processed.replace(/\be\.g\./gi, 'for example');
  processed = processed.replace(/\bi\.e\./gi, 'that is');
  processed = processed.replace(/\bvs\./gi, 'versus');
  processed = processed.replace(/\bMr\./gi, 'Mister');
  processed = processed.replace(/\bMrs\./gi, 'Misses');
  processed = processed.replace(/\bDr\./gi, 'Doctor');
  processed = processed.replace(/\bSt\./gi, 'Saint');
  
  // Handle numbers for better pronunciation
  processed = processed.replace(/(\d+),(\d{3})/g, '$1$2'); // Remove thousand separators for cleaner reading
  
  return processed;
}

// Supported languages with their codes for ElevenLabs
const SUPPORTED_LANGUAGES: Record<string, string> = {
  "auto": "Auto-detect",
  "en": "English",
  "es": "Spanish",
  "fr": "French",
  "de": "German",
  "it": "Italian",
  "pt": "Portuguese",
  "pl": "Polish",
  "hi": "Hindi",
  "ar": "Arabic",
  "zh": "Chinese",
  "ja": "Japanese",
  "ko": "Korean",
  "nl": "Dutch",
  "ru": "Russian",
  "tr": "Turkish",
  "sv": "Swedish",
  "id": "Indonesian",
  "fil": "Filipino",
  "ta": "Tamil",
  "uk": "Ukrainian",
  "el": "Greek",
  "cs": "Czech",
  "fi": "Finnish",
  "hr": "Croatian",
  "ms": "Malay",
  "sk": "Slovak",
  "da": "Danish",
  "bg": "Bulgarian",
  "ro": "Romanian",
  "hu": "Hungarian",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId, language } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY not configured");
    }

    if (!text || !voiceId) {
      throw new Error("Missing required parameters: text and voiceId");
    }

    // Pre-process text for natural speech
    const processedText = preprocessTextForNaturalSpeech(text);
    
    // Determine language code (null for auto-detect)
    const languageCode = language && language !== "auto" ? language : null;
    
    console.log(`Generating TTS for voice ${voiceId}, language: ${language || "auto"}, original length: ${text.length}, processed length: ${processedText.length}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: processedText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            // Higher stability (0.7) for consistent, clear speech
            stability: 0.7,
            // High similarity boost (0.85) to maintain voice characteristics
            similarity_boost: 0.85,
            // Style exaggeration (0.6) for expressive reading with mood/emotion
            style: 0.6,
            // Speaker boost for clarity and presence
            use_speaker_boost: true,
          },
          // Use specified language or auto-detect
          ...(languageCode && { language_code: languageCode }),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log(`Generated audio size: ${audioBuffer.byteLength} bytes`);

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("TTS Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});