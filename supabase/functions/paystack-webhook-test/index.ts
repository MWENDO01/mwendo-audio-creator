import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!PAYSTACK_SECRET_KEY) {
      return new Response(JSON.stringify({ error: "PAYSTACK_SECRET_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Admin role required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const plan: "pro" | "enterprise" = body.plan === "enterprise" ? "enterprise" : "pro";
    const interval: "monthly" | "yearly" = body.interval === "yearly" ? "yearly" : "monthly";
    const email: string = body.email || userData.user.email || "test@example.com";
    const planCodeOverride: string | undefined = typeof body.plan_code === "string" ? body.plan_code : undefined;
    const referenceOverride: string | undefined = typeof body.reference === "string" ? body.reference : undefined;

    const eventId = Date.now();
    const reference = referenceOverride || `mwendo-${plan}-${interval}-test-${eventId}`;
    const event = {
      event: "charge.success",
      data: {
        id: eventId,
        domain: "test",
        status: "success",
        reference,
        amount: plan === "enterprise" ? 5000000 : 2500000,
        message: null,
        gateway_response: "Successful",
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        channel: "test",
        currency: "NGN",
        ip_address: "127.0.0.1",
        metadata: {},
        customer: {
          id: 1,
          first_name: null,
          last_name: null,
          email,
          customer_code: `CUS_test_${eventId}`,
          phone: null,
        },
        plan: {
          id: 1,
          name: `Mwendo ${plan[0].toUpperCase() + plan.slice(1)} ${interval[0].toUpperCase() + interval.slice(1)}`,
          plan_code: planCodeOverride || `PLN_test_${plan}_${interval}`,
          description: null,
          amount: plan === "enterprise" ? 5000000 : 2500000,
          interval,
          currency: "NGN",
        },
        subscription_code: `SUB_test_${eventId}`,
      },
    };

    const payload = JSON.stringify(event);
    const signature = createHmac("sha512", PAYSTACK_SECRET_KEY).update(payload).digest("hex");

    const webhookUrl = `${SUPABASE_URL}/functions/v1/paystack-webhook`;
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-paystack-signature": signature,
      },
      body: payload,
    });
    const respText = await resp.text();

    return new Response(
      JSON.stringify({
        ok: resp.ok,
        status: resp.status,
        response: respText,
        sent: { event: event.event, reference, plan, interval, email },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});