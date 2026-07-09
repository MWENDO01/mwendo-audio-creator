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
import { Loader2, Zap } from "lucide-react";

const Admin = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [plan, setPlan] = useState<"pro" | "enterprise">("pro");
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [email, setEmail] = useState(user?.email ?? "");

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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;