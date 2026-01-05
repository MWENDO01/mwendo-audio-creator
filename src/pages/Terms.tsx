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
              Last updated: January 2025
            </p>

            <div className="glass rounded-2xl p-8 space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using MWENDO's services ("Service"), you accept and agree to be bound by these 
                  Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service. 
                  These Terms apply to all visitors, users, and others who access or use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground">
                  MWENDO provides a text-to-audio conversion service that allows users to convert written text 
                  and PDF documents into audio files using AI-powered voice technology. The Service is provided 
                  "as is" and may be updated, modified, or discontinued at our discretion.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">3. User Accounts</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>When you create an account, you agree to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain and update your information to keep it accurate</li>
                    <li>Maintain the security of your password and account</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Notify us immediately of any unauthorized use</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">4. Acceptable Use</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>You agree NOT to use the Service to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Upload content you don't have the right to convert</li>
                    <li>Violate any intellectual property or proprietary rights</li>
                    <li>Upload illegal, harmful, or offensive content</li>
                    <li>Attempt to gain unauthorized access to the Service</li>
                    <li>Interfere with or disrupt the Service or servers</li>
                    <li>Use the Service for any commercial purpose without authorization</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">5. Subscription and Payments</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    <strong>Billing:</strong> Paid subscriptions are billed in advance on a monthly or annual basis 
                    depending on your selected plan. You authorize us to charge your payment method at the beginning 
                    of each billing period.
                  </p>
                  <p>
                    <strong>Cancellation:</strong> You may cancel your subscription at any time. Upon cancellation, 
                    you will continue to have access to paid features until the end of your current billing period. 
                    No refunds will be issued for partial months.
                  </p>
                  <p>
                    <strong>Money-Back Guarantee:</strong> We offer a 7-day money-back guarantee for new subscribers. 
                    If you're not satisfied within 7 days of your first paid subscription, contact us for a full refund.
                  </p>
                  <p>
                    <strong>Price Changes:</strong> We reserve the right to modify pricing with 30 days' notice. 
                    Existing subscribers will be notified before any price changes take effect.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">6. Intellectual Property</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    <strong>Your Content:</strong> You retain full ownership of all content you upload. By using 
                    our Service, you grant us a limited, non-exclusive license to process your content solely for 
                    the purpose of providing the text-to-audio conversion service.
                  </p>
                  <p>
                    <strong>Our Service:</strong> The Service, including its design, features, and functionality, 
                    is owned by MWENDO and protected by copyright, trademark, and other intellectual property laws.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">7. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  To the maximum extent permitted by law, MWENDO shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, including loss of profits, data, or other intangible 
                  losses, resulting from your use of the Service. Our total liability shall not exceed the amount 
                  you paid us in the 12 months preceding the claim.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">8. Disclaimers</h2>
                <p className="text-muted-foreground">
                  The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind. We do not 
                  guarantee that the Service will be uninterrupted, secure, or error-free. We are not responsible 
                  for the accuracy of AI-generated audio or any errors in conversion.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">9. Termination</h2>
                <p className="text-muted-foreground">
                  We may terminate or suspend your account and access to the Service immediately, without prior 
                  notice, for conduct that we believe violates these Terms or is harmful to other users, us, or 
                  third parties, or for any other reason at our sole discretion.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">10. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these Terms at any time. We will provide notice of material 
                  changes by posting the updated Terms on our website. Your continued use of the Service after 
                  changes constitutes acceptance of the new Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">11. Contact</h2>
                <p className="text-muted-foreground">
                  For any questions regarding these Terms of Service, please contact us at{" "}
                  <a href="mailto:legal@mwendo.com" className="text-primary hover:underline">
                    legal@mwendo.com
                  </a>
                  {" "}or{" "}
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
