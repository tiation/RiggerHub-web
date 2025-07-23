import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity group"
            aria-label="RiggerHub Home"
          >
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-primary-foreground font-bold text-sm">RH</span>
            </div>
            <span className="text-xl font-bold text-foreground">RiggerHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Main navigation">
            <Link to="/jobs" className="text-foreground hover:text-primary transition-colors font-medium story-link">Find Jobs</Link>
            <Link to="/profile" className="text-foreground hover:text-primary transition-colors font-medium story-link">Profile</Link>
            <Link to="/qualifications" className="text-foreground hover:text-primary transition-colors font-medium story-link">Qualifications</Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors font-medium story-link">About</Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" className="hover-scale">Sign In</Button>
            <Button variant="default" className="btn-glow hover-scale">Get Started</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors rounded-md hover:bg-accent"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div id="mobile-menu" className="md:hidden border-t border-border mt-2 pt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              <Link to="/jobs" className="text-foreground hover:text-primary transition-colors">Find Jobs</Link>
              <Link to="/profile" className="text-foreground hover:text-primary transition-colors">Profile</Link>
              <Link to="/qualifications" className="text-foreground hover:text-primary transition-colors">Qualifications</Link>
              <Link to="/about" className="text-foreground hover:text-primary transition-colors">About</Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Button variant="ghost" className="justify-start">Sign In</Button>
                <Button variant="default" className="justify-start">Get Started</Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;