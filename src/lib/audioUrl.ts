import { supabase } from "@/integrations/supabase/client";

/**
 * Extracts the storage path inside the `audio-files` bucket from either
 * a legacy public URL or a raw storage path.
 */
export function pathFromAudioUrl(audioUrlOrPath: string): string {
  if (!audioUrlOrPath) return audioUrlOrPath;
  if (audioUrlOrPath.startsWith("http")) {
    try {
      const url = new URL(audioUrlOrPath);
      const marker = "/audio-files/";
      const idx = url.pathname.indexOf(marker);
      if (idx >= 0) {
        return decodeURIComponent(url.pathname.slice(idx + marker.length));
      }
    } catch {
      // fall through
    }
  }
  return audioUrlOrPath;
}

/**
 * Returns a short-lived signed URL for an audio file in the private bucket.
 * Accepts either a stored storage path or a legacy public URL.
 */
export async function getSignedAudioUrl(
  audioUrlOrPath: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const path = pathFromAudioUrl(audioUrlOrPath);
  const { data, error } = await supabase.storage
    .from("audio-files")
    .createSignedUrl(path, expiresInSeconds);
  if (error || !data?.signedUrl) {
    throw error ?? new Error("Failed to create signed URL");
  }
  return data.signedUrl;
}