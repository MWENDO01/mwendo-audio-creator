import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

const Cookies = () => {
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
              Cookie <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-muted-foreground text-center mb-12">
              Last updated: January 2024
            </p>

            <div className="glass rounded-2xl p-8 space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-4">1. What Are Cookies</h2>
                <p className="text-muted-foreground">
                  Cookies are small text files that are placed on your computer or mobile device when 
                  you visit our website. They help us provide you with a better experience by remembering 
                  your preferences and understanding how you use our service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">2. How We Use Cookies</h2>
                <p className="text-muted-foreground">
                  We use cookies to keep you signed in, remember your preferences, understand how you 
                  interact with our service, and improve your experience. We may also use cookies for 
                  analytics purposes to understand how visitors use our website.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">3. Types of Cookies We Use</h2>
                <ul className="text-muted-foreground space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for the service to function properly.</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences.</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how you use our service.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">4. Managing Cookies</h2>
                <p className="text-muted-foreground">
                  You can control and manage cookies through your browser settings. Please note that 
                  disabling certain cookies may affect the functionality of our service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">5. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about our Cookie Policy, please contact us at{" "}
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

export default Cookies;
