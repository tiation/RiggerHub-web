import React, { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import PostJob, { JobPostingData } from '@/components/PostJob';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useJobPosting } from '@/hooks/use-job-posting';
import { 
  CheckCircle, 
  ArrowLeft, 
  MapPin, 
  Building, 
  DollarSign,
  Users,
  Clock,
  Star,
  Info
} from 'lucide-react';

const PostJobDemo = () => {
  const [showForm, setShowForm] = useState(true);
  const [submittedJob, setSubmittedJob] = useState<JobPostingData | null>(null);
  const { createJobPosting, loading } = useJobPosting();

  const handleJobSubmit = async (jobData: JobPostingData) => {
    console.log('Job posting data:', jobData);
    
    // For demo purposes, just show the submitted data
    setSubmittedJob(jobData);
    setShowForm(false);
    
    // In a real application, you would use the createJobPosting hook
    // const result = await createJobPosting(jobData);
    // if (result) {
    //   setSubmittedJob(jobData);
    //   setShowForm(false);
    // }
  };

  const handleNewJob = () => {
    setSubmittedJob(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumbs />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Job Posting Demo
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Experience how location data is automatically populated from your profile coordinates, 
              eliminating manual text entry for job locations.
            </p>
            
            <Alert className="text-left max-w-2xl mx-auto">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Location Auto-Population:</strong> This demo shows how job postings automatically 
                use your saved profile location coordinates. If you've set your location in your profile, 
                it will be automatically populated here, with the option to override for jobs in different locations.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {showForm ? (
          <>
            {/* Features Overview */}
            <div className="max-w-4xl mx-auto mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Key Features Demonstrated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Auto-Location Population</h4>
                        <p className="text-sm text-muted-foreground">
                          Job location automatically filled from your profile coordinates
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Location Source Tracking</h4>
                        <p className="text-sm text-muted-foreground">
                          System tracks whether location is from profile, manual, or detected
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Override Capability</h4>
                        <p className="text-sm text-muted-foreground">
                          Easy to update if job location differs from your primary location
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Coordinate Precision</h4>
                        <p className="text-sm text-muted-foreground">
                          Uses precise latitude/longitude for accurate job matching
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* PostJob Component */}
            <PostJob 
              onSubmit={handleJobSubmit}
              onCancel={() => window.history.back()}
            />
          </>
        ) : (
          /* Success View */
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <CardTitle className="text-2xl text-success">
                  Job Posting Demo Complete!
                </CardTitle>
                <p className="text-muted-foreground">
                  Here's how your job posting would appear with auto-populated location data:
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {submittedJob && (
                  <>
                    {/* Job Summary */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{submittedJob.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              <span>{submittedJob.company}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{submittedJob.job_type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {submittedJob.urgent && <Badge variant="destructive">Urgent</Badge>}
                          {submittedJob.featured && <Badge className="bg-yellow-500">Featured</Badge>}
                        </div>
                      </div>

                      {/* Location Information - Key Demo Feature */}
                      <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-primary mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-semibold mb-2">Location Data (Auto-Populated)</h4>
                              <div className="space-y-2">
                                <p className="text-sm">
                                  <strong>Address:</strong> {submittedJob.location_text || 'Coordinates provided'}
                                </p>
                                {submittedJob.latitude && submittedJob.longitude && (
                                  <p className="text-sm">
                                    <strong>Coordinates:</strong> {submittedJob.latitude.toFixed(4)}, {submittedJob.longitude.toFixed(4)}
                                  </p>
                                )}
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    Source: {submittedJob.location_source === 'user_profile' ? 'User Profile' :
                                            submittedJob.location_source === 'manual' ? 'Manual Entry' : 'Auto-Detected'}
                                  </Badge>
                                  {submittedJob.location_source === 'user_profile' && (
                                    <Badge variant="outline" className="text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Auto-populated
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Salary */}
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-success" />
                        <span className="font-medium text-success">
                          ${submittedJob.salary_min?.toLocaleString()} - ${submittedJob.salary_max?.toLocaleString()} AUD
                        </span>
                      </div>

                      {/* Description */}
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-muted-foreground">{submittedJob.description}</p>
                      </div>

                      {/* Requirements & Benefits */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {submittedJob.requirements && submittedJob.requirements.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Requirements</h4>
                            <div className="flex flex-wrap gap-2">
                              {submittedJob.requirements.map((req, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {submittedJob.benefits && submittedJob.benefits.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Benefits</h4>
                            <div className="flex flex-wrap gap-2">
                              {submittedJob.benefits.map((benefit, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {benefit}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Key Achievement Alert */}
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Success!</strong> The job posting location was automatically populated from your 
                        saved profile coordinates, eliminating the need for manual text-based location entry. 
                        This ensures consistent, precise location data for better job matching.
                      </AlertDescription>
                    </Alert>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 border-t">
                      <Button onClick={handleNewJob} className="flex-1">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Create Another Job Posting
                      </Button>
                      <Button variant="outline" onClick={() => window.history.back()}>
                        Back to Dashboard
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default PostJobDemo;
