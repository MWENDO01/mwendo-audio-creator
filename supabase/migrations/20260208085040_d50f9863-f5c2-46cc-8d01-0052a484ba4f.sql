-- Recreate the view with security_invoker = on
-- This ensures queries through the view use the caller's permissions,
-- so the subscriptions table's RLS policies are enforced
DROP VIEW IF EXISTS public.subscriptions_public;

CREATE VIEW public.subscriptions_public
WITH (security_invoker = on) AS
SELECT 
    id,
    user_id,
    plan,
    status,
    "interval",
    current_period_start,
    current_period_end,
    created_at,
    updated_at
FROM public.subscriptions;