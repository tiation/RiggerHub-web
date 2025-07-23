import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Building, Filter } from "lucide-react";

const Jobs = () => {
  const jobs = [
    {
      id: 1,
      title: "Senior Rigger - Mining Operation",
      company: "BHP Iron Ore",
      location: "Port Hedland, WA",
      salary: "$120,000 - $140,000",
      type: "Full-time",
      posted: "2 days ago",
      description: "Experienced rigger required for major iron ore mining operation. Must have current WA tickets and 5+ years experience.",
      requirements: ["High Risk Work Licence", "Rigging Intermediate", "Mining experience", "Drug & Alcohol testing"]
    },
    {
      id: 2,
      title: "Dogger - Construction Project",
      company: "Multiplex Construction",
      location: "Perth CBD, WA",
      salary: "$95,000 - $110,000",
      type: "Contract",
      posted: "1 week ago",
      description: "Dogger needed for high-rise construction project in Perth CBD. 18-month contract with potential for extension.",
      requirements: ["Dogging Licence", "Construction experience", "Heights certification", "EWP ticket"]
    },
    {
      id: 3,
      title: "Crane Operator - Infrastructure",
      company: "CPB Contractors",
      location: "Kalgoorlie, WA",
      salary: "$130,000 - $150,000",
      type: "Full-time",
      posted: "3 days ago",
      description: "Mobile crane operator for major infrastructure project. Excellent rates and FIFO arrangements available.",
      requirements: ["HC Licence", "Crane Operator Licence", "Infrastructure experience", "Clean driving record"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Available Jobs</h1>
          <p className="text-muted-foreground">Find your next opportunity in WA's construction, mining, and resources sector.</p>
        </div>

        {/* Job Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Filter Jobs</h2>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="default" size="sm">All Jobs (12)</Button>
            <Button variant="outline" size="sm">Rigger (5)</Button>
            <Button variant="outline" size="sm">Dogger (3)</Button>
            <Button variant="outline" size="sm">Crane Operator (4)</Button>
            <Button variant="outline" size="sm">Mining (6)</Button>
            <Button variant="outline" size="sm">Construction (6)</Button>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 hover:text-primary transition-colors cursor-pointer">
                      {job.title}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center space-x-1">
                        <Building className="w-4 h-4" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{job.posted}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="secondary">{job.type}</Badge>
                      <div className="flex items-center space-x-1 text-success font-medium">
                        <DollarSign className="w-4 h-4" />
                        <span>{job.salary}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button className="w-full md:w-auto">Apply Now</Button>
                    <Button variant="outline" size="sm" className="w-full md:w-auto">Save Job</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{job.description}</p>
                <div>
                  <h4 className="font-medium mb-2">Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((req, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline">Load More Jobs</Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Jobs;