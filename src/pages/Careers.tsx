import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, Heart, Zap, Globe, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

const openPositions = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Build and maintain our React-based web application with a focus on performance and user experience."
  },
  {
    id: 2,
    title: "AI/ML Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Work on improving our text-to-speech models and developing new AI-powered features."
  },
  {
    id: 3,
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    description: "Create intuitive and beautiful user interfaces that make audio conversion accessible to everyone."
  },
  {
    id: 4,
    title: "Customer Success Manager",
    department: "Support",
    location: "Remote",
    type: "Full-time",
    description: "Help our users get the most out of MWENDO and gather feedback to improve our product."
  }
];

const benefits = [
  { icon: Globe, title: "Remote First", description: "Work from anywhere in the world" },
  { icon: Heart, title: "Health Benefits", description: "Comprehensive health coverage" },
  { icon: Coffee, title: "Flexible Hours", description: "Work when you're most productive" },
  { icon: Zap, title: "Growth Budget", description: "Annual learning and development allowance" }
];

const Careers = () => {
  const handleApply = (positionTitle: string) => {
    window.location.href = `mailto:careers@mwendo.com?subject=Application for ${positionTitle}`;
  };

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
              Join Our <span className="gradient-text">Team</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Help us make knowledge accessible to everyone. We're building the future of audio content 
              and looking for talented people to join our mission.
            </p>
          </motion.div>

          {/* Why Join Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-16"
          >
            <div className="glass rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Why Join MWENDO?</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                At MWENDO, you'll work on meaningful problems that impact millions of people. 
                We're a small, passionate team that values creativity, collaboration, and continuous learning.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="text-center">
                    <benefit.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold text-sm mb-1">{benefit.title}</h3>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Open Positions */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
            <div className="space-y-4">
              {openPositions.map((position, index) => (
                <motion.div
                  key={position.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-xl p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{position.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">
                        {position.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {position.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {position.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {position.type}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="gradient"
                      onClick={() => handleApply(position.title)}
                    >
                      Apply Now
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* General Application */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 text-center glass rounded-xl p-8"
            >
              <h3 className="text-xl font-bold mb-2">Don't See the Right Fit?</h3>
              <p className="text-muted-foreground mb-4">
                We're always interested in hearing from talented people. Send us your resume 
                and tell us how you'd like to contribute to our mission.
              </p>
              <Button 
                variant="outline"
                onClick={() => window.location.href = "mailto:careers@mwendo.com?subject=General Application"}
              >
                Send Your Resume
              </Button>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Careers;
