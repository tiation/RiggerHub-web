import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Search, 
  Bell, 
  Shield, 
  MapPin, 
  TrendingUp,
  Users,
  Award
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Smart Job Matching",
      description: "Our AI-powered system matches your skills and qualifications with the perfect job opportunities.",
      color: "text-primary"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Digital Qualifications",
      description: "Store and manage all your certifications, licenses, and qualifications in one secure location.",
      color: "text-secondary"
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Instant Alerts",
      description: "Get notified immediately when new jobs match your profile and preferences.",
      color: "text-primary"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Compliance Tracking",
      description: "Stay compliant with WA safety standards and never miss a certification renewal.",
      color: "text-success"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Location-Based Jobs",
      description: "Find opportunities in your preferred locations across Western Australia.",
      color: "text-secondary"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Career Tracking",
      description: "Monitor your work history, earnings, and career progression over time.",
      color: "text-primary"
    }
  ];

  const stats = [
    { number: "2-5x", label: "Faster Job Placement", icon: <TrendingUp className="w-5 h-5" /> },
    { number: "98%", label: "Worker Satisfaction", icon: <Users className="w-5 h-5" /> },
    { number: "24/7", label: "Platform Availability", icon: <Shield className="w-5 h-5" /> },
    { number: "100%", label: "Verified Companies", icon: <Award className="w-5 h-5" /> }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to <span className="text-primary">Advance Your Career</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            RiggerHub provides all the tools and connections you need to find better opportunities 
            and build a successful career in the rigging industry.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-accent flex items-center justify-center ${feature.color} mb-4`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">Trusted by Industry Leaders</h3>
            <p className="text-white/90">Join thousands of riggers who've advanced their careers with RiggerHub</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2 text-secondary">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.number}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Find Your Next Opportunity?</h3>
          <p className="text-muted-foreground mb-6">Join RiggerHub today and connect with top employers across WA.</p>
          <Button size="lg" className="px-8 py-4 text-lg">
            Create Your Profile
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;