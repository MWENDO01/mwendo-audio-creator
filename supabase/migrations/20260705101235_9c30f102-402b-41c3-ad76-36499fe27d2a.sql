
-- 1. Expand existing RLS update policy to include paystack_email in the immutability check
DROP POLICY IF EXISTS "Users can update only safe subscription fields" ON public.subscriptions;

CREATE POLICY "Users can update only safe subscription fields"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND plan = (SELECT s.plan FROM public.subscriptions s WHERE s.user_id = auth.uid())
  AND status = (SELECT s.status FROM public.subscriptions s WHERE s.user_id = auth.uid())
  AND NOT ("interval" IS DISTINCT FROM (SELECT s."interval" FROM public.subscriptions s WHERE s.user_id = auth.uid()))
  AND NOT (current_period_start IS DISTINCT FROM (SELECT s.current_period_start FROM public.subscriptions s WHERE s.user_id = auth.uid()))
  AND NOT (current_period_end IS DISTINCT FROM (SELECT s.current_period_end FROM public.subscriptions s WHERE s.user_id = auth.uid()))
  AND NOT (paystack_subscription_code IS DISTINCT FROM (SELECT s.paystack_subscription_code FROM public.subscriptions s WHERE s.user_id = auth.uid()))
  AND NOT (paystack_customer_code IS DISTINCT FROM (SELECT s.paystack_customer_code FROM public.subscriptions s WHERE s.user_id = auth.uid()))
  AND NOT (paystack_email IS DISTINCT FROM (SELECT s.paystack_email FROM public.subscriptions s WHERE s.user_id = auth.uid()))
);

-- 2. Defense-in-depth trigger: block any billing-field mutation for non-service_role
CREATE OR REPLACE FUNCTION public.prevent_subscriptions_billing_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  v_role := COALESCE(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '');

  IF v_role = 'service_role' OR current_setting('request.jwt.claims', true) IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.plan IS DISTINCT FROM OLD.plan
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW."interval" IS DISTINCT FROM OLD."interval"
     OR NEW.current_period_start IS DISTINCT FROM OLD.current_period_start
     OR NEW.current_period_end IS DISTINCT FROM OLD.current_period_end
     OR NEW.paystack_subscription_code IS DISTINCT FROM OLD.paystack_subscription_code
     OR NEW.paystack_customer_code IS DISTINCT FROM OLD.paystack_customer_code
     OR NEW.paystack_email IS DISTINCT FROM OLD.paystack_email
  THEN
    RAISE EXCEPTION 'Modification of billing fields is not allowed';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_subscriptions_billing_update_trg ON public.subscriptions;
CREATE TRIGGER prevent_subscriptions_billing_update_trg
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.prevent_subscriptions_billing_update();
