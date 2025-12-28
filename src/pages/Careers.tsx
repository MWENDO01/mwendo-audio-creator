import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const openPositions = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time"
  },
  {
    id: 2,
    title: "AI/ML Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time"
  },
  {
    id: 3,
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time"
  }
];

const Careers = () => {
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
            <p className="text-muted-foreground max-w-xl mx-auto">
              Help us make knowledge accessible to everyone. We're always looking for talented people to join our mission.
            </p>
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
                  className="glass rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-lg">{position.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
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
                  <Button variant="gradient">Apply Now</Button>
                </motion.div>
              ))}
            </div>

            {/* No positions message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 text-center glass rounded-xl p-8"
            >
              <p className="text-muted-foreground mb-4">
                Don't see a position that fits? We're always interested in hearing from talented people.
              </p>
              <Button variant="outline">
                Send us your resume
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
