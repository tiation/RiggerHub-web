import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Briefcase, Shield } from "lucide-react";
import heroImage from "@/assets/hero-construction.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Construction workers and cranes" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50"></div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-3xl">
          <Badge variant="secondary" className="mb-4 text-sm font-medium">
            Western Australia's Premier Rigging Platform
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Your Next <span className="text-secondary">Rigging Job</span> is Here
          </h1>
          
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Connect with top construction, mining, and resources companies across WA. 
            Upload your qualifications, showcase your skills, and get matched with 
            high-paying opportunities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              Start Your Profile
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary">
              Browse Jobs
            </Button>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">500+</div>
                <div className="text-white/80 text-sm">Active Workers</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">150+</div>
                <div className="text-white/80 text-sm">Partner Companies</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">100%</div>
                <div className="text-white/80 text-sm">Compliance Verified</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="container mx-auto px-4 pb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-t-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <span className="text-sm">Instant Job Alerts</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <span className="text-sm">Digital Qualification Storage</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <span className="text-sm">Direct Company Contact</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;