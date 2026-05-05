import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { pathFromAudioUrl } from "@/lib/audioUrl";

export const useAudioStorage = () => {
  const { user } = useAuth();

  /**
   * Uploads an audio blob and returns the storage path (e.g. "<userId>/name.mp3").
   * Callers should request a signed URL via getSignedAudioUrl when playback is needed.
   */
  const uploadAudio = async (audioBlob: Blob, fileName: string): Promise<string> => {
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

    return data.path;
  };

  const deleteAudio = async (audioUrlOrPath: string) => {
    if (!user) {
      throw new Error("User must be authenticated to delete audio");
    }

    const filePath = pathFromAudioUrl(audioUrlOrPath);

    const { error } = await supabase.storage
      .from("audio-files")
      .remove([filePath]);

    if (error) {
      throw error;
    }
  };

  return { uploadAudio, deleteAudio };
};
