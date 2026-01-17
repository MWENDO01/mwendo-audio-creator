import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Voice IDs for different speaker types
const VOICE_TYPES = {
  male_deep: "JBFqnCBsd6RMkjVDRZzb", // George - deep male voice
  male_normal: "TX3LPaxmHKxFdv7VOQHJ", // Liam - normal male voice
  female_normal: "EXAVITQu4vr4xnSDxMaL", // Sarah - normal female voice
  female_soft: "FGY2WhTYpPnrIDTdsKH5", // Laura - soft female voice
  child: "XrExE9yKIg1WjnnlVkGX", // Matilda - younger/lighter voice
  narrator: "onwK4e9ZLuTAKqWW03F9", // Daniel - narrator voice
};

// Common abbreviations and their full pronunciations
const ABBREVIATIONS: Record<string, string> = {
  // Technology
  "I.T": "I T",
  "I.T.": "I T",
  "IT": "I T",
  "I.C.T": "I C T",
  "I.C.T.": "I C T",
  "ICT": "I C T",
  "AI": "A I",
  "A.I": "A I",
  "A.I.": "A I",
  "ML": "M L",
  "API": "A P I",
  "UI": "U I",
  "UX": "U X",
  "CPU": "C P U",
  "GPU": "G P U",
  "RAM": "RAM",
  "ROM": "ROM",
  "USB": "U S B",
  "HTML": "H T M L",
  "CSS": "C S S",
  "SQL": "S Q L",
  "URL": "U R L",
  "WWW": "W W W",
  "HTTP": "H T T P",
  "HTTPS": "H T T P S",
  "IP": "I P",
  "VPN": "V P N",
  "WiFi": "Wi-Fi",
  "WIFI": "Wi-Fi",
  "LAN": "L A N",
  "WAN": "W A N",
  "PDF": "P D F",
  "SMS": "S M S",
  "GPS": "G P S",
  "IoT": "I o T",
  "IOT": "I O T",
  "SaaS": "S A A S",
  "SAAS": "S A A S",
  "SDK": "S D K",
  "IDE": "I D E",
  
  // Common abbreviations
  "etc.": "etcetera",
  "etc": "etcetera",
  "e.g.": "for example",
  "e.g": "for example",
  "i.e.": "that is",
  "i.e": "that is",
  "vs.": "versus",
  "vs": "versus",
  "Mr.": "Mister",
  "Mr": "Mister",
  "Mrs.": "Misses",
  "Mrs": "Misses",
  "Ms.": "Miss",
  "Ms": "Miss",
  "Dr.": "Doctor",
  "Dr": "Doctor",
  "St.": "Saint",
  "Prof.": "Professor",
  "Jr.": "Junior",
  "Sr.": "Senior",
  "Inc.": "Incorporated",
  "Ltd.": "Limited",
  "Corp.": "Corporation",
  "Co.": "Company",
  "Dept.": "Department",
  "Est.": "Established",
  "approx.": "approximately",
  "apt.": "apartment",
  "Ave.": "Avenue",
  "Blvd.": "Boulevard",
  "Rd.": "Road",
  "Ln.": "Lane",
  "Ct.": "Court",
  "no.": "number",
  "No.": "Number",
  "govt.": "government",
  "govt": "government",
  "min.": "minutes",
  "sec.": "seconds",
  "hr.": "hours",
  "hrs.": "hours",
  "wk.": "week",
  "mo.": "month",
  "yr.": "year",
  "yrs.": "years",
  "km": "kilometers",
  "m": "meters",
  "cm": "centimeters",
  "mm": "millimeters",
  "kg": "kilograms",
  "lb": "pounds",
  "lbs": "pounds",
  "oz": "ounces",
  "ft": "feet",
  "in": "inches",
  
  // Organizations & places
  "USA": "U S A",
  "U.S.A": "U S A",
  "U.S.A.": "U S A",
  "US": "U S",
  "U.S": "U S",
  "U.S.": "U S",
  "UK": "U K",
  "U.K": "U K",
  "U.K.": "U K",
  "UN": "U N",
  "EU": "E U",
  "NATO": "NATO",
  "FBI": "F B I",
  "CIA": "C I A",
  "NASA": "NASA",
  "CEO": "C E O",
  "CFO": "C F O",
  "CTO": "C T O",
  "HR": "H R",
  "PR": "P R",
  "FAQ": "F A Q",
  "ATM": "A T M",
  "PIN": "P I N",
  "ID": "I D",
  "DIY": "D I Y",
  "ASAP": "A S A P",
  "FYI": "F Y I",
  "TBD": "T B D",
  "TBA": "T B A",
  "ETA": "E T A",
  "R&D": "R and D",
  "B2B": "B 2 B",
  "B2C": "B 2 C",
};

// Detect the emotion/mood of a text segment
function detectEmotion(text: string): { stability: number; style: number; similarity_boost: number } {
  const lowerText = text.toLowerCase();
  
  // Question detection - more inquisitive tone
  if (text.includes("?") || /^(what|who|when|where|why|how|is|are|do|does|can|could|would|will|shall|may|might)\b/i.test(text)) {
    return { stability: 0.5, style: 0.7, similarity_boost: 0.8 };
  }
  
  // Excitement/emphasis detection
  if (text.includes("!") || /\b(amazing|incredible|fantastic|wonderful|awesome|excellent|great|wow|exciting|excited)\b/i.test(text)) {
    return { stability: 0.4, style: 0.8, similarity_boost: 0.85 };
  }
  
  // Sadness/somber detection
  if (/\b(sad|sorry|unfortunately|regret|miss|lost|died|death|grief|sorrow|tragic|heartbroken)\b/i.test(lowerText)) {
    return { stability: 0.8, style: 0.4, similarity_boost: 0.75 };
  }
  
  // Anger/frustration detection
  if (/\b(angry|furious|frustrated|annoyed|hate|terrible|awful|horrible|unacceptable)\b/i.test(lowerText)) {
    return { stability: 0.3, style: 0.9, similarity_boost: 0.9 };
  }
  
  // Calm/instructional detection
  if (/\b(step|first|second|then|next|finally|please|note|remember|important|carefully)\b/i.test(lowerText)) {
    return { stability: 0.8, style: 0.3, similarity_boost: 0.8 };
  }
  
  // Default neutral/narrative
  return { stability: 0.7, style: 0.6, similarity_boost: 0.85 };
}

// Character voice variation settings - same voice but with different characteristics
interface CharacterVoiceVariation {
  stability: number;      // 0-1: Lower = more expressive/varied, Higher = more consistent
  similarity_boost: number; // 0-1: Lower = more variation from base, Higher = closer to original
  style: number;          // 0-1: Style exaggeration
  speed_modifier?: number; // Optional: speaking pace hint (not directly supported but affects generation)
}

// Define voice variations for different character types (using SAME base voice)
const CHARACTER_VARIATIONS: Record<string, CharacterVoiceVariation> = {
  // Deep/authoritative characters - more stable, lower style for gravitas
  deep_male: { stability: 0.85, similarity_boost: 0.6, style: 0.3 },
  
  // Soft/gentle characters - higher stability, moderate style
  soft_female: { stability: 0.8, similarity_boost: 0.75, style: 0.4 },
  
  // Child-like characters - lower stability for playful variation, higher style
  child: { stability: 0.4, similarity_boost: 0.5, style: 0.9 },
  
  // Villain/intense characters - low stability for dramatic effect
  villain: { stability: 0.3, similarity_boost: 0.65, style: 0.95 },
  
  // Elderly characters - high stability, lower similarity for aged effect
  elderly: { stability: 0.9, similarity_boost: 0.55, style: 0.25 },
  
  // Excited/energetic characters - low stability, high style
  energetic: { stability: 0.35, similarity_boost: 0.7, style: 0.85 },
  
  // Calm narrator - baseline stable voice
  narrator: { stability: 0.75, similarity_boost: 0.85, style: 0.5 },
  
  // Default variation for unrecognized speakers
  default_speaker_1: { stability: 0.6, similarity_boost: 0.7, style: 0.6 },
  default_speaker_2: { stability: 0.5, similarity_boost: 0.65, style: 0.7 },
  default_speaker_3: { stability: 0.7, similarity_boost: 0.6, style: 0.5 },
  default_speaker_4: { stability: 0.45, similarity_boost: 0.75, style: 0.65 },
  default_speaker_5: { stability: 0.55, similarity_boost: 0.55, style: 0.75 },
};

// Detect character type from speaker name and context for voice variation
function detectCharacterType(speakerName: string, dialogueContext: string): string {
  const lowerName = speakerName.toLowerCase();
  const lowerContext = dialogueContext.toLowerCase();
  
  // Child detection
  if (/\b(child|kid|boy|girl|son|daughter|little|young|baby|toddler|mommy|daddy|kiddo)\b/i.test(lowerName) ||
      /\b(child|kid|little|young|squeaked|giggled|whined)\b/i.test(lowerContext)) {
    return "child";
  }
  
  // Villain/antagonist detection
  if (/\b(villain|dark|lord|evil|demon|devil|shadow|death|doom|monster|beast)\b/i.test(lowerName) ||
      /\b(growled|snarled|hissed|menacing|threatening|sinister|evil)\b/i.test(lowerContext)) {
    return "villain";
  }
  
  // Deep/authoritative male detection
  if (/\b(father|dad|grandfather|grandpa|sir|boss|commander|captain|chief|lord|king|general|master)\b/i.test(lowerName) ||
      /\b(deep|gruff|stern|authoritative|booming|commanded|ordered)\b/i.test(lowerContext)) {
    return "deep_male";
  }
  
  // Elderly detection
  if (/\b(grandfather|grandpa|grandmother|grandma|elder|old|ancient|wise)\b/i.test(lowerName) ||
      /\b(creaked|wheezed|slowly|elderly|aged|withered)\b/i.test(lowerContext)) {
    return "elderly";
  }
  
  // Soft/gentle female detection
  if (/\b(mother|mom|grandmother|grandma|lady|aunt|nurse|teacher|sister)\b/i.test(lowerName) ||
      /\b(gentle|soft|kind|warm|caring|whispered|soothed)\b/i.test(lowerContext)) {
    return "soft_female";
  }
  
  // Excited/energetic detection
  if (/\b(excited|shouted|exclaimed|yelled|screamed|laughed)\b/i.test(lowerContext) ||
      dialogueContext.includes("!")) {
    return "energetic";
  }
  
  return ""; // Will use rotating default variations
}

// Parse text for conversations and assign voice VARIATIONS (same voice, different settings)
interface DialogueSegment {
  text: string;
  voiceId: string;
  voiceSettings: { stability: number; style: number; similarity_boost: number };
  speakerName?: string;
}

function parseConversation(text: string, defaultVoiceId: string): DialogueSegment[] {
  const segments: DialogueSegment[] = [];
  const speakerVariations: Map<string, CharacterVoiceVariation> = new Map();
  const defaultVariationKeys = ["default_speaker_1", "default_speaker_2", "default_speaker_3", "default_speaker_4", "default_speaker_5"];
  let speakerIndex = 0;
  
  // Pattern to detect dialogue: "Speaker: dialogue" or "Speaker said" patterns
  const dialoguePattern = /(?:^|\n)([A-Z][a-zA-Z\s]*?):\s*["']?(.+?)["']?(?=\n[A-Z]|\n\n|$)/gs;
  
  // Check if text has clear dialogue markers
  const hasDialogueMarkers = dialoguePattern.test(text);
  dialoguePattern.lastIndex = 0; // Reset regex
  
  if (hasDialogueMarkers) {
    let lastIndex = 0;
    let match;
    
    while ((match = dialoguePattern.exec(text)) !== null) {
      const [fullMatch, speaker, dialogue] = match;
      
      // Add any narration before this dialogue
      if (match.index > lastIndex) {
        const narration = text.slice(lastIndex, match.index).trim();
        if (narration) {
          const emotionSettings = detectEmotion(narration);
          // Narrator uses stable, consistent variation
          const narratorVariation = CHARACTER_VARIATIONS.narrator;
          segments.push({
            text: narration,
            voiceId: defaultVoiceId,
            voiceSettings: {
              stability: (narratorVariation.stability + emotionSettings.stability) / 2,
              style: (narratorVariation.style + emotionSettings.style) / 2,
              similarity_boost: narratorVariation.similarity_boost,
            },
          });
        }
      }
      
      // Get or assign voice variation for this speaker (using SAME voice but different settings)
      const speakerKey = speaker.trim().toLowerCase();
      let variation = speakerVariations.get(speakerKey);
      
      if (!variation) {
        // Detect character type first
        const characterType = detectCharacterType(speaker, dialogue);
        
        if (characterType && CHARACTER_VARIATIONS[characterType]) {
          variation = CHARACTER_VARIATIONS[characterType];
        } else {
          // Assign a unique default variation for this speaker
          const variationKey = defaultVariationKeys[speakerIndex % defaultVariationKeys.length];
          variation = CHARACTER_VARIATIONS[variationKey];
          speakerIndex++;
        }
        
        speakerVariations.set(speakerKey, variation);
        console.log(`Assigned voice variation to "${speaker}": stability=${variation.stability}, style=${variation.style}`);
      }
      
      // Combine character variation with emotion detection
      const emotionSettings = detectEmotion(dialogue);
      
      segments.push({
        text: dialogue.trim(),
        voiceId: defaultVoiceId, // ALWAYS use the same base voice
        voiceSettings: {
          // Blend character variation with emotion for natural delivery
          stability: (variation.stability * 0.6) + (emotionSettings.stability * 0.4),
          style: (variation.style * 0.5) + (emotionSettings.style * 0.5),
          similarity_boost: variation.similarity_boost,
        },
        speakerName: speaker.trim(),
      });
      
      lastIndex = match.index + fullMatch.length;
    }
    
    // Add remaining narration
    if (lastIndex < text.length) {
      const remaining = text.slice(lastIndex).trim();
      if (remaining) {
        const narratorVariation = CHARACTER_VARIATIONS.narrator;
        const emotionSettings = detectEmotion(remaining);
        segments.push({
          text: remaining,
          voiceId: defaultVoiceId,
          voiceSettings: {
            stability: (narratorVariation.stability + emotionSettings.stability) / 2,
            style: (narratorVariation.style + emotionSettings.style) / 2,
            similarity_boost: narratorVariation.similarity_boost,
          },
        });
      }
    }
  }
  
  // If no dialogue markers found, treat as single segment with emotion detection
  if (segments.length === 0) {
    segments.push({
      text: text,
      voiceId: defaultVoiceId,
      voiceSettings: detectEmotion(text),
    });
  }
  
  return segments;
}

// Expand abbreviations for proper pronunciation
function expandAbbreviations(text: string): string {
  let processed = text;
  
  // Sort abbreviations by length (longest first) to avoid partial replacements
  const sortedAbbreviations = Object.entries(ABBREVIATIONS)
    .sort((a, b) => b[0].length - a[0].length);
  
  for (const [abbr, expansion] of sortedAbbreviations) {
    // Create word boundary regex for each abbreviation
    const escapedAbbr = abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedAbbr}\\b`, 'g');
    processed = processed.replace(regex, expansion);
  }
  
  return processed;
}

// Pre-process text for more natural speech with proper pauses and emphasis
function preprocessTextForNaturalSpeech(text: string): string {
  let processed = text;
  
  // First expand abbreviations
  processed = expandAbbreviations(processed);
  
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
  
  // Handle numbers for better pronunciation
  processed = processed.replace(/(\d+),(\d{3})/g, '$1$2'); // Remove thousand separators for cleaner reading
  
  // Handle ordinals
  processed = processed.replace(/(\d+)st\b/g, '$1st');
  processed = processed.replace(/(\d+)nd\b/g, '$1nd');
  processed = processed.replace(/(\d+)rd\b/g, '$1rd');
  processed = processed.replace(/(\d+)th\b/g, '$1th');
  
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

// Concatenate audio buffers
function concatenateAudioBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
  const totalLength = buffers.reduce((acc, buf) => acc + buf.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const buffer of buffers) {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }
  
  return result.buffer;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - missing authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("Authentication failed:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`Authenticated user: ${userId}`);

    const { text, voiceId, language, enableMultiVoice = true, voiceSettings } = await req.json();
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
    
    console.log(`Generating TTS - Voice: ${voiceId}, Language: ${language || "auto"}, MultiVoice: ${enableMultiVoice}, CustomSettings: ${!!voiceSettings}, Length: ${processedText.length}`);

    // If custom voice settings are provided (for character preview), use them directly
    // Otherwise, parse conversation for multi-voice support
    let segments: DialogueSegment[];
    
    if (voiceSettings) {
      // Direct voice settings provided (character preview mode)
      segments = [{
        text: processedText,
        voiceId: voiceId,
        voiceSettings: {
          stability: voiceSettings.stability ?? 0.7,
          style: voiceSettings.style ?? 0.6,
          similarity_boost: voiceSettings.similarity_boost ?? 0.85,
        },
      }];
      console.log(`Using custom voice settings: stability=${voiceSettings.stability}, style=${voiceSettings.style}`);
    } else if (enableMultiVoice) {
      segments = parseConversation(processedText, voiceId);
    } else {
      segments = [{
        text: processedText,
        voiceId: voiceId,
        voiceSettings: detectEmotion(processedText),
      }];
    }

    console.log(`Parsed ${segments.length} segments for TTS generation`);

    // Generate audio for each segment
    const audioBuffers: ArrayBuffer[] = [];
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      
      if (!segment.text.trim()) continue;
      
      console.log(`Generating segment ${i + 1}/${segments.length}: "${segment.text.substring(0, 50)}..." with voice ${segment.voiceId}`);
      
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${segment.voiceId}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: segment.text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: segment.voiceSettings.stability,
              similarity_boost: segment.voiceSettings.similarity_boost,
              style: segment.voiceSettings.style,
              use_speaker_boost: true,
            },
            ...(languageCode && { language_code: languageCode }),
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs API error for segment ${i + 1}:`, errorText);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      audioBuffers.push(audioBuffer);
    }

    // Concatenate all audio buffers
    const finalAudioBuffer = audioBuffers.length === 1 
      ? audioBuffers[0] 
      : concatenateAudioBuffers(audioBuffers);

    console.log(`Generated final audio: ${finalAudioBuffer.byteLength} bytes from ${segments.length} segments`);

    return new Response(finalAudioBuffer, {
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
