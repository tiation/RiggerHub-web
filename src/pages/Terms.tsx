import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg text-muted-foreground">
            <p className="mb-6">
              Welcome to RiggerHub. These terms and conditions outline the rules and regulations for the use of our platform.
            </p>
            
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using RiggerHub, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">User Responsibilities</h2>
            <p className="mb-4">
              Users are responsible for maintaining accurate qualification information and adhering to all safety standards 
              in the construction, mining, and resources industries.
            </p>
            
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Contact Information</h2>
            <p>
              For questions regarding these terms, please contact us at support@riggerhub.com.au
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;