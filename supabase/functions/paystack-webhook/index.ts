import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

interface PaystackEvent {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: {
      custom_fields?: Array<{
        display_name: string;
        variable_name: string;
        value: string;
      }>;
    };
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
    };
    plan?: {
      id: number;
      name: string;
      plan_code: string;
      description: string | null;
      amount: number;
      interval: string;
      currency: string;
    };
    subscription_code?: string;
    next_payment_date?: string;
  };
}

function verifyPaystackSignature(
  payload: string,
  signature: string,
  secretKey: string
): boolean {
  const hash = createHmac("sha512", secretKey).update(payload).digest("hex");
  return hash === signature;
}

function extractPlanFromReference(reference: string, planData?: { name?: string; plan_code?: string }): {
  plan: "pro" | "enterprise";
  interval: "monthly" | "yearly";
} | null {
  // Try strict pattern matching first
  const strictPattern = /^mwendo-(pro|enterprise)-(monthly|yearly)/i;
  const strictMatch = reference.match(strictPattern);
  
  if (strictMatch) {
    return {
      plan: strictMatch[1].toLowerCase() as "pro" | "enterprise",
      interval: strictMatch[2].toLowerCase() as "monthly" | "yearly",
    };
  }
  
  // Log suspicious reference for audit
  console.warn(`Non-standard reference format: "${reference}". Falling back to plan data verification.`);
  
  // Fallback: Cross-check with Paystack plan data if available
  if (planData?.name) {
    const planName = planData.name.toLowerCase();
    let plan: "pro" | "enterprise" = "pro";
    let interval: "monthly" | "yearly" = "monthly";
    
    if (planName.includes("enterprise")) {
      plan = "enterprise";
    }
    if (planName.includes("year") || planName.includes("annual")) {
      interval = "yearly";
    }
    
    console.log(`Verified plan from Paystack data: plan=${plan}, interval=${interval}`);
    return { plan, interval };
  }
  
  // If no valid pattern and no plan data, return null (don't guess)
  console.error(`Cannot determine plan from reference "${reference}" - no plan data available`);
  return null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!PAYSTACK_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      console.error("No Paystack signature found");
      return new Response(
        JSON.stringify({ error: "No signature provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify signature
    const isValid = verifyPaystackSignature(rawBody, signature, PAYSTACK_SECRET_KEY);
    if (!isValid) {
      console.error("Invalid Paystack signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const event: PaystackEvent = JSON.parse(rawBody);
    console.log(`Received Paystack event: ${event.event}`);
    console.log("Event data:", JSON.stringify(event.data, null, 2));

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Handle different event types
    switch (event.event) {
      case "charge.success": {
        const customerEmail = event.data.customer.email;
        const customerCode = event.data.customer.customer_code;
        const reference = event.data.reference;
        
        console.log(`Processing successful charge for ${customerEmail}`);
        
        // Extract plan details from reference with Paystack plan data verification
        const planDetails = extractPlanFromReference(reference, event.data.plan);
        
        if (!planDetails) {
          console.error("Could not determine plan from reference or plan data:", reference);
          // Don't process subscription without valid plan
          return new Response(
            JSON.stringify({ received: true, message: "Invalid plan reference" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        console.log(`Extracted plan: ${planDetails.plan}, interval: ${planDetails.interval}`);
        
        // Find user by email
        const { data: users, error: userError } = await supabase.auth.admin.listUsers();
        
        if (userError) {
          console.error("Error fetching users:", userError);
          throw userError;
        }
        
        const user = users.users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase());
        
        if (!user) {
          console.log(`No user found with email ${customerEmail}`);
          return new Response(
            JSON.stringify({ received: true, message: "No matching user found" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        console.log(`Found user ${user.id} for email ${customerEmail}`);
        
        // Calculate subscription period (1 month or 1 year from now)
        const now = new Date();
        const periodEnd = new Date(now);
        if (planDetails.interval === "yearly") {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }
        
        // Upsert subscription
        const { error: subscriptionError } = await supabase
          .from("subscriptions")
          .upsert({
            user_id: user.id,
            plan: planDetails.plan,
            status: "active",
            interval: planDetails.interval,
            paystack_customer_code: customerCode,
            paystack_subscription_code: event.data.subscription_code || null,
            paystack_email: customerEmail,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
          }, {
            onConflict: "user_id"
          });
        
        if (subscriptionError) {
          console.error("Error upserting subscription:", subscriptionError);
          throw subscriptionError;
        }
        
        console.log(`Successfully updated subscription for user ${user.id}`);
        break;
      }
      
      case "subscription.create": {
        console.log("Subscription created:", event.data.subscription_code);
        break;
      }
      
      case "subscription.disable":
      case "subscription.not_renew": {
        const customerEmail = event.data.customer.email;
        
        // Find user by email
        const { data: users } = await supabase.auth.admin.listUsers();
        const user = users?.users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase());
        
        if (user) {
          await supabase
            .from("subscriptions")
            .update({
              status: "cancelled",
            })
            .eq("user_id", user.id);
          
          console.log(`Cancelled subscription for user ${user.id}`);
        }
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});