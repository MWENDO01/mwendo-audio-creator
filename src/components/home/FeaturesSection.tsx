import { FileText, Mic, Download, Zap, Shield, Globe } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: FileText,
    title: "PDF to Audio",
    description: "Upload any PDF document and convert it to high-quality audio instantly.",
  },
  {
    icon: Mic,
    title: "Multiple Voices",
    description: "Choose from 15+ AI voices including male, female, and various accents.",
  },
  {
    icon: Download,
    title: "Easy Download",
    description: "Download your audio files in MP3 format, ready for any device.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Our AI processes your content in seconds, not minutes.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your documents are encrypted and automatically deleted after processing.",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description: "Support for multiple languages and regional accents.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Create{" "}
            <span className="gradient-text">Amazing Audio</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to make book-to-audio conversion simple, fast, and professional.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group glass rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 card-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
