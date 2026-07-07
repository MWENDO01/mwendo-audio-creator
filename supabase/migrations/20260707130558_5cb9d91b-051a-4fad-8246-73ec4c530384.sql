-- Backend enforcement: free users limited to 3 audio conversions, subscribers unlimited
CREATE OR REPLACE FUNCTION public.enforce_free_upload_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan text;
  v_status text;
  v_count int;
  v_role text;
BEGIN
  v_role := COALESCE(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '');
  -- service_role and internal calls bypass
  IF current_setting('request.jwt.claims', true) IS NULL OR v_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  SELECT plan::text, status::text INTO v_plan, v_status
    FROM public.subscriptions
   WHERE user_id = NEW.user_id;

  -- Active paid subscribers -> unlimited
  IF v_plan IS NOT NULL AND v_plan IN ('pro','enterprise') AND v_status = 'active' THEN
    RETURN NEW;
  END IF;

  -- Free / no active sub -> cap at 3
  SELECT count(*) INTO v_count
    FROM public.audio_conversions
   WHERE user_id = NEW.user_id;

  IF v_count >= 3 THEN
    RAISE EXCEPTION 'Free plan limit reached: upgrade to a paid plan to create more conversions'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audio_conversions_free_upload_limit ON public.audio_conversions;
CREATE TRIGGER audio_conversions_free_upload_limit
BEFORE INSERT ON public.audio_conversions
FOR EACH ROW EXECUTE FUNCTION public.enforce_free_upload_limit();