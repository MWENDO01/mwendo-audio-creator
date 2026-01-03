import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAudioStorage = () => {
  const { user } = useAuth();

  const uploadAudio = async (audioBlob: Blob, fileName: string) => {
    if (!user) {
      throw new Error("User must be authenticated to upload audio");
    }

    const fileExt = "mp3";
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, "_");
    const filePath = `${user.id}/${sanitizedFileName}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("audio-files")
      .upload(filePath, audioBlob, {
        contentType: "audio/mpeg",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from("audio-files")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const deleteAudio = async (audioUrl: string) => {
    if (!user) {
      throw new Error("User must be authenticated to delete audio");
    }

    // Extract file path from URL
    const url = new URL(audioUrl);
    const pathParts = url.pathname.split("/audio-files/");
    if (pathParts.length < 2) {
      throw new Error("Invalid audio URL");
    }

    const filePath = decodeURIComponent(pathParts[1]);

    const { error } = await supabase.storage
      .from("audio-files")
      .remove([filePath]);

    if (error) {
      throw error;
    }
  };

  return { uploadAudio, deleteAudio };
};
