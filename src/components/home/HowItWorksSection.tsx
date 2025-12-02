import { Upload, Settings, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Content",
    description: "Upload a PDF document or paste your text directly into the editor.",
  },
  {
    icon: Settings,
    step: "02",
    title: "Choose Your Voice",
    description: "Select from our library of natural AI voices with different styles and accents.",
  },
  {
    icon: Headphones,
    step: "03",
    title: "Download & Listen",
    description: "Preview your audio and download it in high-quality MP3 format.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 relative bg-card/30">
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
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Convert your books to audio in three simple steps
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-accent/50" />
              )}
              
              {/* Step Number */}
              <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full glass mb-6 group">
                <span className="absolute -top-2 -right-2 text-5xl font-bold text-primary/20">{item.step}</span>
                <item.icon className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
              </div>
              
              <h3 className="font-semibold text-xl mb-3">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
