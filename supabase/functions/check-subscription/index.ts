import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // First, check our local subscriptions table (populated by webhook)
    const { data: localSubscription, error: localError } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (localError) {
      logStep("Error checking local subscription", { error: localError.message });
    }

    if (localSubscription && localSubscription.status === "active") {
      // Check if subscription hasn't expired
      const periodEnd = localSubscription.current_period_end 
        ? new Date(localSubscription.current_period_end) 
        : null;
      
      const isValid = !periodEnd || periodEnd > new Date();
      
      if (isValid) {
        logStep("Found valid local subscription", { 
          plan: localSubscription.plan, 
          status: localSubscription.status,
          periodEnd: localSubscription.current_period_end 
        });
        
        return new Response(JSON.stringify({
          subscribed: true,
          plan: localSubscription.plan,
          product_id: localSubscription.paystack_subscription_code,
          subscription_end: localSubscription.current_period_end,
          character_limit: localSubscription.plan === "enterprise" ? null : 
                           localSubscription.plan === "pro" ? 200000 : 70000,
          pdf_limit: localSubscription.plan === "free" ? 3 : null,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        // Subscription expired, update status
        logStep("Local subscription expired, updating status");
        await supabaseClient
          .from("subscriptions")
          .update({ status: "expired" })
          .eq("user_id", user.id);
      }
    }

    // Fallback: Check Paystack directly (for cases where webhook hasn't fired yet)
    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackKey) {
      logStep("PAYSTACK_SECRET_KEY not set, returning free plan");
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "free",
        product_id: null,
        subscription_end: null,
        character_limit: 70000,
        pdf_limit: 3,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check if customer exists in Paystack
    const customerResponse = await fetch(
      `https://api.paystack.co/customer/${encodeURIComponent(user.email)}`,
      {
        headers: {
          Authorization: `Bearer ${paystackKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!customerResponse.ok) {
      logStep("No customer found in Paystack, returning free plan");
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "free",
        product_id: null,
        subscription_end: null,
        character_limit: 70000,
        pdf_limit: 3,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerData = await customerResponse.json();
    
    if (!customerData.status || !customerData.data) {
      logStep("Customer not found in Paystack");
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "free",
        product_id: null,
        subscription_end: null,
        character_limit: 70000,
        pdf_limit: 3,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerCode = customerData.data.customer_code;
    logStep("Found Paystack customer", { customerCode });

    // List subscriptions for this customer
    const subscriptionsResponse = await fetch(
      `https://api.paystack.co/subscription?customer=${customerCode}`,
      {
        headers: {
          Authorization: `Bearer ${paystackKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!subscriptionsResponse.ok) {
      logStep("Error fetching subscriptions from Paystack");
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "free",
        product_id: null,
        subscription_end: null,
        character_limit: 70000,
        pdf_limit: 3,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscriptionsData = await subscriptionsResponse.json();
    const subscriptions = subscriptionsData.data || [];
    
    // Find active subscription
    const activeSubscription = subscriptions.find(
      (sub: { status: string }) => sub.status === "active" || sub.status === "non-renewing"
    );

    let hasActiveSub = !!activeSubscription;
    let planCode = null;
    let plan: "free" | "pro" | "enterprise" = "free";
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = activeSubscription;
      subscriptionEnd = subscription.next_payment_date;
      planCode = subscription.plan?.plan_code;
      
      logStep("Active subscription found in Paystack", { 
        subscriptionCode: subscription.subscription_code, 
        nextPaymentDate: subscriptionEnd,
        planCode 
      });
      
      // Determine plan based on plan name or amount
      const planName = (subscription.plan?.name || "").toLowerCase();
      const amount = subscription.amount || subscription.plan?.amount || 0;
      
      if (planName.includes("enterprise") || amount >= 1500000) {
        plan = "enterprise";
      } else if (planName.includes("pro") || amount >= 500) {
        plan = "pro";
      }
      
      logStep("Determined subscription plan", { plan, planCode, amount });

      // Sync to local subscriptions table
      const periodEnd = subscriptionEnd ? new Date(subscriptionEnd) : new Date();
      if (!subscriptionEnd) {
        // If no next payment date, calculate based on interval
        const interval = subscription.plan?.interval || "monthly";
        if (interval === "annually" || interval === "yearly") {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }
      }

      await supabaseClient
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          plan,
          status: "active",
          interval: subscription.plan?.interval === "annually" ? "yearly" : "monthly",
          paystack_customer_code: customerCode,
          paystack_subscription_code: subscription.subscription_code,
          paystack_email: user.email,
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
        }, {
          onConflict: "user_id"
        });

      logStep("Synced subscription to local database");
    } else {
      logStep("No active subscription found in Paystack");
    }

    const characterLimit = plan === "enterprise" ? null : plan === "pro" ? 200000 : 70000;
    const pdfLimit = plan === "free" ? 3 : null;

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan,
      product_id: planCode,
      subscription_end: subscriptionEnd,
      character_limit: characterLimit,
      pdf_limit: pdfLimit,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    // Sanitize error message - don't leak implementation details
    return new Response(JSON.stringify({ error: "Subscription check failed", code: "CHECK_ERROR" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});