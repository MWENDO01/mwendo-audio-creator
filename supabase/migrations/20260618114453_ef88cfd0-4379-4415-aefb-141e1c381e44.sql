
-- 1. Lock down user_roles: revoke write privileges from anon/authenticated
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.user_roles FROM anon, authenticated, PUBLIC;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Explicit restrictive deny policies for clarity
DROP POLICY IF EXISTS "Deny user role writes" ON public.user_roles;
CREATE POLICY "Deny user role writes" ON public.user_roles
  AS RESTRICTIVE
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

-- Re-allow SELECT via a permissive policy already exists ("Users view own roles").
-- The restrictive ALL policy with USING(false) would block SELECT too. Scope it to writes instead.
DROP POLICY IF EXISTS "Deny user role writes" ON public.user_roles;
CREATE POLICY "Deny user role inserts" ON public.user_roles AS RESTRICTIVE FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "Deny user role updates" ON public.user_roles AS RESTRICTIVE FOR UPDATE TO authenticated, anon USING (false) WITH CHECK (false);
CREATE POLICY "Deny user role deletes" ON public.user_roles AS RESTRICTIVE FOR DELETE TO authenticated, anon USING (false);

-- 2. Prevent users from changing sensitive fields on audio_conversions
CREATE OR REPLACE FUNCTION public.prevent_audio_conversions_sensitive_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role and postgres to change anything
  IF current_setting('request.jwt.claims', true) IS NULL
     OR (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.audio_url IS DISTINCT FROM OLD.audio_url
     OR NEW.character_count IS DISTINCT FROM OLD.character_count
     OR NEW.voice_id IS DISTINCT FROM OLD.voice_id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Modification of protected fields (status, audio_url, character_count, voice_id, user_id) is not allowed';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audio_conversions_protect_sensitive ON public.audio_conversions;
CREATE TRIGGER audio_conversions_protect_sensitive
BEFORE UPDATE ON public.audio_conversions
FOR EACH ROW EXECUTE FUNCTION public.prevent_audio_conversions_sensitive_update();
