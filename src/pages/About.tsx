import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Users, Target, Heart, Zap } from "lucide-react";

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
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're on a mission to make books and documents accessible to everyone through the power of AI voice technology.
            </p>
          </motion.div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto mb-16"
          >
            <div className="glass rounded-2xl p-8">
              <Target className="w-12 h-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                To democratize access to written content by converting any text or document into high-quality audio, 
                making knowledge accessible to everyone regardless of their reading ability or time constraints.
              </p>
            </div>
            <div className="glass rounded-2xl p-8">
              <Heart className="w-12 h-12 text-accent mb-4" />
              <h2 className="text-2xl font-bold mb-4">Our Values</h2>
              <p className="text-muted-foreground">
                We believe in accessibility, innovation, and user-first design. Every feature we build 
                is crafted with our users' needs in mind, ensuring a seamless experience.
              </p>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {[
              {
                icon: Users,
                title: "10,000+",
                description: "Happy Users"
              },
              {
                icon: Zap,
                title: "500,000+",
                description: "Conversions Made"
              },
              {
                icon: Heart,
                title: "99.9%",
                description: "Uptime"
              }
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
