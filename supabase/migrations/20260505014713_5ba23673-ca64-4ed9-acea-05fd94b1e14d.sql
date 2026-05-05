DROP POLICY IF EXISTS "Service role can update subscriptions" ON public.subscriptions;

CREATE POLICY "Users can update their own subscription"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);