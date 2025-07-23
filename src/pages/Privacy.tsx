import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg text-muted-foreground">
            <p className="mb-6">
              At RiggerHub, we are committed to protecting your privacy and ensuring the security of your personal information.
            </p>
            
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Information We Collect</h2>
            <p className="mb-4">
              We collect information you provide directly to us, such as when you create an account, upload qualifications, 
              or apply for jobs through our platform.
            </p>
            
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">How We Use Your Information</h2>
            <p className="mb-4">
              We use your information to provide our services, match you with relevant job opportunities, 
              and ensure compliance with industry safety standards.
            </p>
            
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at support@riggerhub.com.au
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;