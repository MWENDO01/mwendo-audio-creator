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
              Last updated: January 2024
            </p>

            <div className="glass rounded-2xl p-8 space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-4">1. Information We Collect</h2>
                <p className="text-muted-foreground">
                  We collect information you provide directly to us, such as when you create an account, 
                  upload documents for conversion, or contact us for support. This may include your name, 
                  email address, and the content you upload for conversion.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">2. How We Use Your Information</h2>
                <p className="text-muted-foreground">
                  We use the information we collect to provide, maintain, and improve our services, 
                  process your text-to-audio conversions, send you technical notices and support messages, 
                  and respond to your comments and questions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">3. Data Security</h2>
                <p className="text-muted-foreground">
                  We take reasonable measures to help protect your personal information from loss, theft, 
                  misuse, unauthorized access, disclosure, alteration, and destruction. Your uploaded 
                  documents are processed securely and deleted after conversion unless you choose to save them.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">4. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at{" "}
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
