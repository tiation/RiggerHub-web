import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";

const Safety = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Safety Guidelines</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card p-6 rounded-lg border text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Safety First</h3>
              <p className="text-muted-foreground">All operations must prioritize worker safety above all else.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border text-center">
              <AlertTriangle className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Risk Assessment</h3>
              <p className="text-muted-foreground">Conduct thorough risk assessments before any rigging operation.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border text-center">
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Compliance</h3>
              <p className="text-muted-foreground">Ensure all work meets Australian safety standards and regulations.</p>
            </div>
          </div>
          
          <div className="prose prose-lg text-muted-foreground">
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Key Safety Requirements</h2>
            <ul className="space-y-2 mb-6">
              <li>Valid High Risk Work Licence (HRWL) for all rigging operations</li>
              <li>Current first aid certification and safety training</li>
              <li>Proper use of personal protective equipment (PPE)</li>
              <li>Pre-operation equipment inspections and safety checks</li>
              <li>Clear communication protocols during lifting operations</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Emergency Procedures</h2>
            <p className="mb-4">
              All workers must be familiar with site-specific emergency procedures and have immediate access to 
              emergency contact information. In case of accidents, follow the site emergency response plan and 
              notify supervisors immediately.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Safety;