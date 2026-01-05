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
              Last updated: January 2025
            </p>

            <div className="glass rounded-2xl p-8 space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-4">1. What Are Cookies</h2>
                <p className="text-muted-foreground">
                  Cookies are small text files that are placed on your computer or mobile device when 
                  you visit our website. They are widely used to make websites work more efficiently, 
                  provide a better user experience, and give website owners information about how 
                  their site is being used.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">2. How We Use Cookies</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>MWENDO uses cookies to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Keep you signed in to your account</li>
                    <li>Remember your preferences and settings</li>
                    <li>Understand how you interact with our service</li>
                    <li>Improve your experience based on your usage patterns</li>
                    <li>Analyze site traffic and performance</li>
                    <li>Provide personalized features and content</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">3. Types of Cookies We Use</h2>
                <div className="space-y-4 text-muted-foreground">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <h3 className="font-semibold mb-2">Essential Cookies</h3>
                    <p className="text-sm">
                      Required for the service to function properly. These enable core functionality 
                      such as security, network management, and account access. You cannot opt out 
                      of these cookies.
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <h3 className="font-semibold mb-2">Preference Cookies</h3>
                    <p className="text-sm">
                      Remember your settings and preferences (language, theme, playback speed, etc.) 
                      to provide a more personalized experience on subsequent visits.
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <h3 className="font-semibold mb-2">Analytics Cookies</h3>
                    <p className="text-sm">
                      Help us understand how visitors interact with our website by collecting and 
                      reporting information anonymously. We use this data to improve our service.
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <h3 className="font-semibold mb-2">Marketing Cookies</h3>
                    <p className="text-sm">
                      Used to track visitors across websites to display relevant advertisements. 
                      We currently do not use marketing cookies, but we may in the future with 
                      your consent.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">4. Third-Party Cookies</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>Some cookies are placed by third-party services that appear on our pages:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Stripe:</strong> For secure payment processing</li>
                    <li><strong>Supabase:</strong> For authentication and data management</li>
                    <li><strong>Analytics providers:</strong> To help us understand site usage</li>
                  </ul>
                  <p className="mt-4">
                    These third parties have their own privacy policies, and we encourage you to 
                    review them for more information about their data practices.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">5. Cookie Duration</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>Cookies can be either "session" or "persistent":</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                    <li><strong>Persistent Cookies:</strong> Remain on your device for a set period 
                    (up to 1 year for some preference cookies)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">6. Managing Cookies</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Most web browsers allow you to control cookies through their settings. You can:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>View what cookies are stored and delete them individually</li>
                    <li>Block third-party cookies</li>
                    <li>Block all cookies from all sites</li>
                    <li>Delete all cookies when you close your browser</li>
                  </ul>
                  <p className="mt-4">
                    <strong>Note:</strong> Disabling essential cookies may affect the functionality 
                    of our service. You may not be able to sign in, and some features may not work 
                    as expected.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">7. Browser-Specific Settings</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>To manage cookies in your browser, visit:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                    <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                    <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
                    <li><a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">8. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Cookie Policy from time to time to reflect changes in our 
                  practices or for operational, legal, or regulatory reasons. We will notify you 
                  of any material changes by updating the "Last updated" date at the top of this page.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">9. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about our Cookie Policy, please contact us at{" "}
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

export default Cookies;
