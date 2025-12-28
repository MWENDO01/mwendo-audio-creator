import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const blogPosts = [
  {
    id: 1,
    title: "How AI is Revolutionizing Text-to-Speech Technology",
    excerpt: "Discover how artificial intelligence is making voice synthesis more natural and accessible than ever before.",
    date: "Jan 15, 2024",
    category: "Technology"
  },
  {
    id: 2,
    title: "5 Ways to Make Your Commute More Productive",
    excerpt: "Turn your daily commute into learning time by listening to your favorite books and documents.",
    date: "Jan 10, 2024",
    category: "Productivity"
  },
  {
    id: 3,
    title: "The Future of Audiobooks and Accessibility",
    excerpt: "How text-to-speech technology is making content more accessible for people with visual impairments.",
    date: "Jan 5, 2024",
    category: "Accessibility"
  }
];

const Blog = () => {
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
              Our <span className="gradient-text">Blog</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Insights, updates, and tips on text-to-speech technology and productivity.
            </p>
          </motion.div>

          {/* Blog Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 card-shadow hover:border-primary/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </span>
                </div>
                <h2 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {post.excerpt}
                </p>
                <Button variant="ghost" size="sm" className="p-0 h-auto text-primary">
                  Read more <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
