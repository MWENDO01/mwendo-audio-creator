-- Create a view for user-facing subscription queries that hides sensitive payment fields
CREATE VIEW public.subscriptions_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    user_id,
    plan,
    status,
    interval,
    current_period_start,
    current_period_end,
    created_at,
    updated_at
    -- Excludes: paystack_customer_code, paystack_subscription_code, paystack_email
  FROM public.subscriptions;

-- Grant access to authenticated users
GRANT SELECT ON public.subscriptions_public TO authenticated;

-- Add comment explaining the view's purpose
COMMENT ON VIEW public.subscriptions_public IS 'Public view of subscriptions hiding sensitive payment provider codes';