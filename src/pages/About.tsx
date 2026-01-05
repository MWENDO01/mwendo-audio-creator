import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Users, Target, Heart, Zap, Globe, Shield, Headphones } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              About <span className="gradient-text">MWENDO</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We're on a mission to make books and documents accessible to everyone through the power of AI voice technology.
            </p>
          </motion.div>

          {/* Story Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-16"
          >
            <div className="glass rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl font-bold mb-6 text-center">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  MWENDO was born from a simple observation: in our busy world, many people struggle to find time to read. 
                  Commuters, busy professionals, and people with visual impairments often miss out on valuable content 
                  simply because reading isn't always convenient or accessible.
                </p>
                <p>
                  Founded in 2024, we set out to bridge this gap by leveraging cutting-edge AI voice technology. 
                  Our platform transforms any text or PDF document into natural-sounding audio, allowing you to 
                  consume content while commuting, exercising, or doing household chores.
                </p>
                <p>
                  Today, MWENDO serves thousands of users worldwide, from students and professionals to authors 
                  and content creators who want to make their work more accessible.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Mission & Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16"
          >
            <div className="glass rounded-2xl p-8">
              <Target className="w-12 h-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                To democratize access to written content by converting any text or document into high-quality audio, 
                making knowledge accessible to everyone regardless of their reading ability, time constraints, or 
                physical limitations. We believe everyone deserves access to information.
              </p>
            </div>
            <div className="glass rounded-2xl p-8">
              <Heart className="w-12 h-12 text-accent mb-4" />
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground">
                We envision a world where no content is inaccessible. Whether you're a student studying on the go, 
                a professional catching up on reports during your commute, or someone with visual impairments, 
                we want MWENDO to be your gateway to unlimited knowledge.
              </p>
            </div>
          </motion.div>

          {/* Core Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto mb-16"
          >
            <h2 className="text-2xl font-bold text-center mb-8">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass rounded-xl p-6 text-center">
                <Globe className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Accessibility</h3>
                <p className="text-sm text-muted-foreground">
                  We believe knowledge should be accessible to everyone, regardless of how they consume content.
                </p>
              </div>
              <div className="glass rounded-xl p-6 text-center">
                <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Privacy First</h3>
                <p className="text-sm text-muted-foreground">
                  Your documents are processed securely and we never store or share your personal content.
                </p>
              </div>
              <div className="glass rounded-xl p-6 text-center">
                <Headphones className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Quality Audio</h3>
                <p className="text-sm text-muted-foreground">
                  We use the latest AI technology to deliver natural, human-like voice output.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            {[
              { icon: Users, title: "10,000+", description: "Happy Users" },
              { icon: Zap, title: "500,000+", description: "Conversions Made" },
              { icon: Globe, title: "50+", description: "Countries Served" },
              { icon: Heart, title: "99.9%", description: "Uptime" }
            ].map((stat, index) => (
              <div key={index} className="glass rounded-xl p-6 text-center">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold gradient-text mb-1">{stat.title}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
