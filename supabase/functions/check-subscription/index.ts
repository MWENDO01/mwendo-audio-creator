import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
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

    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackKey) throw new Error("PAYSTACK_SECRET_KEY is not set");
    logStep("Paystack key verified");

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
      logStep("No customer found, returning unsubscribed state");
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "free",
        product_id: null,
        subscription_end: null
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
        subscription_end: null
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
      logStep("Error fetching subscriptions");
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "free",
        product_id: null,
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscriptionsData = await subscriptionsResponse.json();
    const subscriptions = subscriptionsData.data || [];
    
    // Find active subscription
    const activeSubscription = subscriptions.find(
      (sub: any) => sub.status === "active" || sub.status === "non-renewing"
    );

    let hasActiveSub = !!activeSubscription;
    let planCode = null;
    let plan = "free";
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = activeSubscription;
      subscriptionEnd = subscription.next_payment_date;
      planCode = subscription.plan?.plan_code;
      
      logStep("Active subscription found", { 
        subscriptionCode: subscription.subscription_code, 
        nextPaymentDate: subscriptionEnd,
        planCode 
      });
      
      // Determine plan based on plan amount (in kobo/cents)
      const amount = subscription.amount || subscription.plan?.amount || 0;
      
      // Pro plans: ~NGN 5,000-15,000 or ~$6.99
      // Enterprise plans: ~NGN 15,000+ or ~$20.99
      if (amount >= 1500000) { // NGN 15,000+ in kobo
        plan = "enterprise";
      } else if (amount >= 500) { // NGN 500+ in kobo or $5+
        plan = "pro";
      }
      
      logStep("Determined subscription plan", { plan, planCode, amount });
    } else {
      logStep("No active subscription found");
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan,
      product_id: planCode,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
