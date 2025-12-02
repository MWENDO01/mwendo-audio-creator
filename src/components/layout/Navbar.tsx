import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AudioLines, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/converter", label: "Converter" },
    { href: "/pricing", label: "Pricing" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/25 transition-shadow">
              <AudioLines className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">MWENDO</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Button
                  variant="ghost"
                  className={isActive(link.href) ? "text-primary" : "text-muted-foreground"}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link to="/converter">
              <Button variant="gradient">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href} onClick={() => setIsOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActive(link.href) ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              <Link to="/converter" onClick={() => setIsOpen(false)}>
                <Button variant="gradient" className="w-full mt-2">
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
