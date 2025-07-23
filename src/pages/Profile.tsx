import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  FileText, 
  Briefcase,
  Edit,
  Upload,
  ExternalLink
} from "lucide-react";

const Profile = () => {
  const { toast } = useToast();

  const handleEditProfile = () => {
    toast({
      title: "Edit Profile",
      description: "Profile editing functionality will be available soon.",
    });
  };

  const handleUploadQualification = () => {
    toast({
      title: "Upload Qualification",
      description: "Redirecting to qualifications page...",
    });
  };

  const handleSettingsAction = (action: string) => {
    toast({
      title: action,
      description: "This feature will be available in the next update.",
    });
  };
  const userProfile = {
    name: "John Morrison",
    email: "john.morrison@email.com",
    phone: "+61 400 123 456",
    location: "Perth, WA",
    experience: "8 years",
    specialization: "Senior Rigger",
    status: "Available"
  };

  const qualifications = [
    { name: "High Risk Work Licence", status: "Current", expires: "2025-03-15" },
    { name: "Rigging Intermediate", status: "Current", expires: "2024-12-10" },
    { name: "Working at Heights", status: "Current", expires: "2025-01-20" },
    { name: "First Aid Certificate", status: "Expires Soon", expires: "2024-08-30" }
  ];

  const workHistory = [
    {
      company: "Rio Tinto",
      position: "Senior Rigger",
      duration: "2022 - 2024",
      project: "Iron Ore Expansion Project",
      location: "Pilbara, WA"
    },
    {
      company: "Fortescue Metals",
      position: "Rigger",
      duration: "2020 - 2022",
      project: "Solomon Hub Operations",
      location: "Pilbara, WA"
    },
    {
      company: "BHP",
      position: "Junior Rigger",
      duration: "2018 - 2020",
      project: "Port Hedland Operations",
      location: "Port Hedland, WA"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">{userProfile.name}</h1>
                    <p className="text-lg text-muted-foreground mb-2">{userProfile.specialization}</p>
                    <Badge variant="secondary" className="mb-4">{userProfile.status}</Badge>
                  </div>
                  <Button onClick={handleEditProfile} className="mt-4 md:mt-0">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{userProfile.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{userProfile.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{userProfile.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span>{userProfile.experience} experience</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="qualifications" className="space-y-4">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
            <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
            <TabsTrigger value="experience">Work History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="qualifications" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Qualifications & Certifications</h2>
              <Link to="/qualifications">
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Manage Qualifications
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="grid gap-4">
              {qualifications.map((qual, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="bg-accent p-2 rounded-lg">
                          <Award className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{qual.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="w-4 h-4" />
                            <span>Expires: {qual.expires}</span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={qual.status === "Current" ? "default" : "destructive"}
                        className={qual.status === "Current" ? "bg-success" : ""}
                      >
                        {qual.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="experience" className="space-y-4">
            <h2 className="text-xl font-semibold">Work History</h2>
            
            <div className="space-y-4">
              {workHistory.map((job, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{job.position}</h3>
                        <p className="text-primary font-medium">{job.company}</p>
                        <p className="text-muted-foreground">{job.project}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{job.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-xl font-semibold">Profile Settings</h2>
            
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Availability Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleSettingsAction("Update Availability Status")}
                  >
                    Update Availability Status
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleSettingsAction("Set Location Preferences")}
                  >
                    Set Location Preferences
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleSettingsAction("Configure Job Alerts")}
                  >
                    Configure Job Alerts
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleSettingsAction("Change Password")}
                  >
                    Change Password
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleSettingsAction("Update Contact Information")}
                  >
                    Update Contact Information
                  </Button>
                  <Link to="/privacy" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      Privacy Settings
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;