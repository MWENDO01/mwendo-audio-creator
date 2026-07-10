import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Zap, CheckCircle2, XCircle, PlayCircle } from "lucide-react";

type PlanKey = "pro" | "enterprise";
type IntervalKey = "monthly" | "yearly";

const PAYSTACK_PLANS: Array<{
  code: string;
  name: string;
  plan: PlanKey;
  interval: IntervalKey;
}> = [
  { code: "PLN_t36b6g42apm3qal", name: "Mwendo Pro Monthly", plan: "pro", interval: "monthly" },
  { code: "PLN_l2j0n4padowl5qe", name: "Mwendo Pro Yearly", plan: "pro", interval: "yearly" },
  { code: "PLN_bhu8om98kj5y9lp", name: "Mwendo Enterprise Monthly", plan: "enterprise", interval: "monthly" },
  { code: "PLN_3vi5z80lkml8x6e", name: "Mwendo Enterprise Yearly", plan: "enterprise", interval: "yearly" },
];

interface SuiteResult {
  code: string;
  name: string;
  expected: { plan: PlanKey; interval: IntervalKey };
  webhookOk: boolean;
  webhookStatus?: number;
  webhookResponse?: string;
  stored?: { plan: string | null; interval: string | null; status: string | null };
  passed: boolean;
  error?: string;
}

const Admin = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [plan, setPlan] = useState<"pro" | "enterprise">("pro");
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [email, setEmail] = useState(user?.email ?? "");
  const [suiteRunning, setSuiteRunning] = useState(false);
  const [suiteResults, setSuiteResults] = useState<SuiteResult[]>([]);

  const sendTest = async () => {
    setLoading(true);
    setResult("");
    try {
      const { data, error } = await supabase.functions.invoke("paystack-webhook-test", {
        body: { plan, interval, email },
      });
      if (error) throw error;
      setResult(JSON.stringify(data, null, 2));
      if (data?.ok) {
        toast.success("Synthetic webhook accepted");
        queryClient.invalidateQueries({ queryKey: ["subscription"] });
      } else {
        toast.error(`Webhook returned status ${data?.status}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(msg);
      setResult(msg);
    } finally {
      setLoading(false);
    }
  };

  const runFullSuite = async () => {
    setSuiteRunning(true);
    setSuiteResults([]);
    const results: SuiteResult[] = [];

    for (const p of PAYSTACK_PLANS) {
      const base: SuiteResult = {
        code: p.code,
        name: p.name,
        expected: { plan: p.plan, interval: p.interval },
        webhookOk: false,
        passed: false,
      };
      try {
        const reference = `mwendo-${p.plan}-${p.interval}-suite-${Date.now()}`;
        const { data, error } = await supabase.functions.invoke("paystack-webhook-test", {
          body: {
            plan: p.plan,
            interval: p.interval,
            email,
            plan_code: p.code,
            reference,
          },
        });
        if (error) throw error;
        base.webhookOk = !!data?.ok;
        base.webhookStatus = data?.status;
        base.webhookResponse = typeof data?.response === "string" ? data.response : JSON.stringify(data?.response);

        // Small delay so the webhook finishes the upsert before we read back.
        await new Promise((r) => setTimeout(r, 400));

        const { data: sub, error: subErr } = await supabase
          .from("subscriptions_public" as any)
          .select("plan,interval,status")
          .eq("user_id", user?.id)
          .maybeSingle();
        if (subErr) throw subErr;

        const stored = (sub as any) || null;
        base.stored = stored
          ? { plan: stored.plan, interval: stored.interval, status: stored.status }
          : { plan: null, interval: null, status: null };
        base.passed =
          base.webhookOk &&
          stored?.plan === p.plan &&
          stored?.interval === p.interval &&
          stored?.status === "active";
      } catch (e) {
        base.error = e instanceof Error ? e.message : String(e);
      }
      results.push(base);
      setSuiteResults([...results]);
    }

    queryClient.invalidateQueries({ queryKey: ["subscription"] });
    const passed = results.filter((r) => r.passed).length;
    if (passed === results.length) toast.success(`All ${passed}/${results.length} plan tests passed`);
    else toast.error(`${passed}/${results.length} plan tests passed`);
    setSuiteRunning(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-3xl font-bold mb-6">Admin</h1>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Paystack Webhook Tester
              </CardTitle>
              <CardDescription>
                Sends a signed synthetic <code>charge.success</code> event to the webhook.
                Requires the <code>admin</code> role.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Select value={plan} onValueChange={(v) => setPlan(v as "pro" | "enterprise")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Interval</Label>
                  <Select value={interval} onValueChange={(v) => setInterval(v as "monthly" | "yearly")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Customer email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
                <p className="text-xs text-muted-foreground">
                  Must match an existing user for the subscription to be upserted.
                </p>
              </div>
              <Button onClick={sendTest} disabled={loading || !email} className="w-full">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</> : "Send synthetic charge.success"}
              </Button>
              {result && (
                <pre className="mt-4 p-4 rounded-md bg-muted text-xs overflow-auto max-h-80">
{result}
                </pre>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                Full Plan Suite
              </CardTitle>
              <CardDescription>
                Fires a synthetic <code>charge.success</code> for each Paystack plan code and
                verifies the stored plan, interval, and status match.
                <br />
                <span className="text-xs text-muted-foreground">
                  Runs sequentially against <code>{email || "the email above"}</code>. This
                  overwrites the current user's subscription row — last plan wins.
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={runFullSuite}
                disabled={suiteRunning || !email}
                variant="secondary"
                className="w-full"
              >
                {suiteRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running suite…
                  </>
                ) : (
                  "Run all 4 plan codes"
                )}
              </Button>

              {suiteResults.length > 0 && (
                <div className="space-y-2">
                  {suiteResults.map((r) => (
                    <div
                      key={r.code}
                      className="rounded-md border border-border p-3 text-sm space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium flex items-center gap-2">
                          {r.passed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                          {r.name}
                        </div>
                        <code className="text-xs text-muted-foreground">{r.code}</code>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Expected: <code>{r.expected.plan}/{r.expected.interval}</code> · Stored:{" "}
                        <code>
                          {r.stored?.plan ?? "—"}/{r.stored?.interval ?? "—"} ({r.stored?.status ?? "—"})
                        </code>
                        {typeof r.webhookStatus === "number" && (
                          <> · Webhook: {r.webhookStatus}</>
                        )}
                      </div>
                      {r.error && (
                        <div className="text-xs text-destructive">Error: {r.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;