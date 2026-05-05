import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { pathFromAudioUrl } from "@/lib/audioUrl";

export interface AudioConversion {
  id: string;
  user_id: string;
  name: string;
  original_filename: string | null;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  audio_url: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  character_count: number | null;
  voice_id: string | null;
  voice_name: string | null;
  created_at: string;
  updated_at: string;
}

export const useConversions = () => {
  const { user } = useAuth();
  const [conversions, setConversions] = useState<AudioConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDuration, setTotalDuration] = useState(0);

  const fetchConversions = useCallback(async () => {
    if (!user) {
      setConversions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("audio_conversions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const typed = (data || []) as AudioConversion[];
      setConversions(typed);
      
      // Calculate total duration
      const total = typed.reduce((acc, conv) => acc + (conv.duration_seconds || 0), 0);
      setTotalDuration(total);
    } catch (error) {
      console.error("Error fetching conversions:", error);
      toast.error("Failed to load conversions");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteConversion = async (id: string) => {
    try {
      // Find the conversion to get the audio URL
      const conversion = conversions.find((c) => c.id === id);
      
      // Delete from storage if audio_url exists
      if (conversion?.audio_url) {
        try {
          const filePath = pathFromAudioUrl(conversion.audio_url);
          if (filePath) {
            await supabase.storage.from("audio-files").remove([filePath]);
          }
        } catch (storageError) {
          console.error("Error deleting from storage:", storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete from database
      const { error } = await supabase
        .from("audio_conversions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setConversions((prev) => prev.filter((conv) => conv.id !== id));
      toast.success("Conversion deleted");
    } catch (error) {
      console.error("Error deleting conversion:", error);
      toast.error("Failed to delete conversion");
    }
  };

  useEffect(() => {
    fetchConversions();
  }, [fetchConversions]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return {
    conversions,
    loading,
    totalDuration,
    totalFiles: conversions.length,
    fetchConversions,
    deleteConversion,
    formatDuration,
    formatFileSize,
  };
};
