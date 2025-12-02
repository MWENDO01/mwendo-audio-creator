import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    description: "Perfect for trying out MWENDO",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "3 PDF uploads total",
      "5,000 characters per conversion",
      "4 free voice options",
      "Standard audio quality",
      "MP3 downloads",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    description: "For regular users and content creators",
    monthlyPrice: 9.99,
    yearlyPrice: 99,
    features: [
      "Unlimited PDF uploads",
      "50,000 characters per conversion",
      "All 15+ premium voices",
      "High-quality audio (320kbps)",
      "Priority processing",
      "Custom voice uploads",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For teams and organizations",
    monthlyPrice: 29.99,
    yearlyPrice: 299,
    features: [
      "Everything in Pro",
      "Unlimited characters",
      "API access",
      "Bulk conversions",
      "Custom voice cloning",
      "Analytics dashboard",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Simple, Transparent <span className="gradient-text">Pricing</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Choose the plan that's right for you. All plans include core features.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={!isYearly ? "text-foreground" : "text-muted-foreground"}>
                Monthly
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <span className={isYearly ? "text-foreground" : "text-muted-foreground"}>
                Yearly
              </span>
              {isYearly && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                  Save 17%
                </span>
              )}
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl p-6 ${
                  plan.popular
                    ? "glass border-2 border-primary card-shadow"
                    : "glass card-shadow"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-muted-foreground">
                        /{isYearly ? "year" : "month"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  variant={plan.popular ? "gradient" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24 max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, PayPal, and M-Pesa for users in Kenya."
                },
                {
                  q: "Can I cancel my subscription anytime?",
                  a: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
                },
                {
                  q: "Do you offer refunds?",
                  a: "We offer a 7-day money-back guarantee for all paid plans. If you're not satisfied, contact us for a full refund."
                },
                {
                  q: "What file formats are supported?",
                  a: "We currently support PDF documents for upload and export audio in MP3 format (320kbps for Pro users)."
                },
              ].map((faq, index) => (
                <div key={index} className="glass rounded-xl p-5">
                  <h4 className="font-medium mb-2">{faq.q}</h4>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
