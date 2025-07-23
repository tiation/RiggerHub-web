import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Contact Support</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-card p-6 rounded-lg border">
              <Mail className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Email Support</h3>
              <p className="text-muted-foreground mb-4">Get help via email</p>
              <a href="mailto:support@riggerhub.com.au" className="text-primary hover:underline">
                support@riggerhub.com.au
              </a>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <Phone className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Phone Support</h3>
              <p className="text-muted-foreground mb-4">Call us during business hours</p>
              <a href="tel:+61891234567" className="text-primary hover:underline">
                +61 8 9123 4567
              </a>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <MapPin className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Head Office</h3>
              <p className="text-muted-foreground">Perth, Western Australia</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;