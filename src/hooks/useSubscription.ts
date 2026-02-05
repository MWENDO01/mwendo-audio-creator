import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionPlan = "free" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "pending";
export type SubscriptionInterval = "monthly" | "yearly";

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  interval: SubscriptionInterval | null;
  paystack_customer_code: string | null;
  paystack_subscription_code: string | null;
  paystack_email: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const { user } = useAuth();

  const { data: subscription, isLoading, error, refetch } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async (): Promise<Subscription | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription:", error);
        throw error;
      }

      return data as Subscription | null;
    },
    enabled: !!user,
  });

  const isActive = subscription?.status === "active";
  const isPro = isActive && subscription?.plan === "pro";
  const isEnterprise = isActive && subscription?.plan === "enterprise";
  const hasPaidPlan = isPro || isEnterprise;

  // Character limits based on plan
  const characterLimit = isEnterprise ? Infinity : isPro ? 200000 : 70000;
  const pdfLimit = hasPaidPlan ? Infinity : 3;

  return {
    subscription,
    isLoading,
    error,
    refetch,
    isActive,
    isPro,
    isEnterprise,
    hasPaidPlan,
    plan: subscription?.plan || "free",
    characterLimit,
    pdfLimit,
  };
}