import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
              Terms of <span className="gradient-text">Service</span>
            </h1>
            <p className="text-muted-foreground text-center mb-12">
              Last updated: January 2024
            </p>

            <div className="glass rounded-2xl p-8 space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using MWENDO's services, you accept and agree to be bound by these 
                  Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">2. Use of Service</h2>
                <p className="text-muted-foreground">
                  You may use our service to convert text and PDF documents to audio for personal or 
                  commercial use. You must ensure you have the right to convert any content you upload 
                  and that your use complies with all applicable laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">3. Subscription and Payments</h2>
                <p className="text-muted-foreground">
                  Paid subscriptions are billed monthly or annually. You can cancel your subscription 
                  at any time, and you will continue to have access until the end of your billing period. 
                  We offer a 7-day money-back guarantee for new subscribers.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">4. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  You retain ownership of all content you upload. By using our service, you grant us a 
                  limited license to process your content solely for the purpose of providing our 
                  text-to-audio conversion service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">5. Contact</h2>
                <p className="text-muted-foreground">
                  For any questions regarding these Terms of Service, please contact us at{" "}
                  <a href="mailto:davidmwendo64@gmail.com" className="text-primary hover:underline">
                    davidmwendo64@gmail.com
                  </a>
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
