import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

const Privacy = () => {
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
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-muted-foreground text-center mb-12">
              Last updated: January 2025
            </p>

            <div className="glass rounded-2xl p-8 space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-4">1. Information We Collect</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>We collect information you provide directly to us, including:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Account Information:</strong> Name, email address, and password when you create an account.</li>
                    <li><strong>Payment Information:</strong> Billing details processed securely through our payment providers (Stripe, PayPal).</li>
                    <li><strong>Content:</strong> Documents and text you upload for conversion (processed and deleted after conversion unless saved).</li>
                    <li><strong>Usage Data:</strong> Information about how you interact with our service.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">2. How We Use Your Information</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide, maintain, and improve our text-to-audio conversion services</li>
                    <li>Process your conversions and deliver audio files</li>
                    <li>Send you technical notices, updates, and support messages</li>
                    <li>Respond to your comments, questions, and customer service requests</li>
                    <li>Monitor and analyze trends, usage, and activities</li>
                    <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">3. Information Sharing</h2>
                <p className="text-muted-foreground">
                  We do not sell, trade, or rent your personal information to third parties. We may share 
                  your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-3 text-muted-foreground">
                  <li>With service providers who assist in our operations (payment processing, hosting)</li>
                  <li>To comply with legal obligations or protect our rights</li>
                  <li>With your consent or at your direction</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">4. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement industry-standard security measures to protect your personal information. 
                  This includes encryption of data in transit and at rest, secure servers, and regular 
                  security audits. Your uploaded documents are processed in isolated environments and 
                  automatically deleted after conversion unless you explicitly choose to save them to your library.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">5. Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain your account information for as long as your account is active. Uploaded 
                  documents are processed and deleted immediately after conversion unless saved to your 
                  library. Saved audio files are retained until you delete them or close your account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">6. Your Rights</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>You have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Access and receive a copy of your personal data</li>
                    <li>Request correction of inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Object to or restrict processing of your data</li>
                    <li>Data portability</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">7. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Our service is not intended for children under 13 years of age. We do not knowingly 
                  collect personal information from children under 13. If you believe we have collected 
                  information from a child under 13, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">8. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of any changes 
                  by posting the new policy on this page and updating the "Last updated" date. We encourage 
                  you to review this policy periodically.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">9. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy or our data practices, please contact us at{" "}
                  <a href="mailto:privacy@mwendo.com" className="text-primary hover:underline">
                    privacy@mwendo.com
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

export default Privacy;
