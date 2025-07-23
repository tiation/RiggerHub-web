import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import LocationPermissionManager, { LocationData } from '@/components/ui/location-permission-manager';
import { 
  MapPin, 
  Building, 
  DollarSign, 
  Clock, 
  FileText, 
  Users, 
  Navigation,
  AlertCircle,
  CheckCircle,
  MapIcon,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { reverseGeocode } from '@/utils/geolocation';

export interface JobPostingData {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary_min: number;
  salary_max: number;
  job_type: 'full-time' | 'part-time' | 'contract' | 'casual';
  category: string;
  urgent: boolean;
  featured: boolean;
  latitude?: number;
  longitude?: number;
  location_text?: string;
  location_source: 'user_profile' | 'manual' | 'detected';
}

interface PostJobProps {
  onSubmit?: (jobData: JobPostingData) => void;
  onCancel?: () => void;
  className?: string;
}

const PostJob: React.FC<PostJobProps> = ({ onSubmit, onCancel, className = "" }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showLocationManager, setShowLocationManager] = useState(false);
  
  // Job form data
  const [formData, setFormData] = useState<Partial<JobPostingData>>({
    title: '',
    company: '',
    description: '',
    requirements: [],
    benefits: [],
    salary_min: 0,
    salary_max: 0,
    job_type: 'full-time',
    category: '',
    urgent: false,
    featured: false,
    location_source: 'user_profile'
  });

  // Location state
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'loaded' | 'manual' | 'error'>('loading');
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Form arrays for dynamic inputs
  const [requirementInput, setRequirementInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  // Job categories
  const jobCategories = [
    'rigger',
    'dogger', 
    'crane-operator',
    'scaffolder',
    'safety-officer',
    'supervisor',
    'trades-assistant',
    'other'
  ];

  // Auto-populate location from user profile on component mount
  useEffect(() => {
    loadUserLocationFromProfile();
  }, []);

  const loadUserLocationFromProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('latitude, longitude, location')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.warn('Failed to load user profile location:', error);
        setLocationStatus('error');
        setLocationError('Could not load your saved location');
        return;
      }

      if (profile?.latitude && profile?.longitude) {
        // Auto-populate from user's saved coordinates
        const locationData: LocationData = {
          latitude: profile.latitude,
          longitude: profile.longitude,
          isManual: false,
          timestamp: Date.now(),
          address: profile.location || undefined
        };

        setUserLocation(locationData);
        setFormData(prev => ({
          ...prev,
          latitude: profile.latitude,
          longitude: profile.longitude,
          location_text: profile.location,
          location_source: 'user_profile'
        }));
        setLocationStatus('loaded');

        // If no readable address, try reverse geocoding
        if (!profile.location) {
          try {
            const address = await reverseGeocode(profile.latitude, profile.longitude);
            setFormData(prev => ({
              ...prev,
              location_text: address
            }));
            setUserLocation(prev => prev ? { ...prev, address } : null);
          } catch (error) {
            console.warn('Reverse geocoding failed:', error);
          }
        }

        toast({
          title: "Location Auto-populated",
          description: "Job location has been set from your saved profile location.",
        });
      } else if (profile?.location) {
        // User has text location but no coordinates
        setFormData(prev => ({
          ...prev,
          location_text: profile.location,
          location_source: 'user_profile'
        }));
        setLocationStatus('loaded');
      } else {
        // No location data in profile
        setLocationStatus('manual');
      }
    } catch (error) {
      console.error('Error loading user location:', error);
      setLocationStatus('error');
      setLocationError('Failed to load location data');
    }
  };

  const handleLocationChange = (location: LocationData | null) => {
    setUserLocation(location);
    setShowLocationManager(false);
    
    if (location) {
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        location_text: location.address || (location.latitude && location.longitude ? 
          `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : ''),
        location_source: location.isManual ? 'manual' : 'detected'
      }));
      setLocationStatus('loaded');
      
      toast({
        title: "Location Updated",
        description: location.address ? 
          `Job location set to ${location.address}` : 
          "Job location coordinates updated",
      });
    } else {
      setLocationStatus('manual');
    }
  };

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...(prev.requirements || []), requirementInput.trim()]
      }));
      setRequirementInput('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements?.filter((_, i) => i !== index) || []
    }));
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...(prev.benefits || []), benefitInput.trim()]
      }));
      setBenefitInput('');
    }
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.title?.trim()) {
        throw new Error('Job title is required');
      }
      if (!formData.company?.trim()) {
        throw new Error('Company name is required');
      }
      if (!formData.description?.trim()) {
        throw new Error('Job description is required');
      }
      if (!formData.category) {
        throw new Error('Job category is required');
      }
      if (!formData.salary_min || !formData.salary_max) {
        throw new Error('Salary range is required');
      }
      if (formData.salary_min >= formData.salary_max) {
        throw new Error('Maximum salary must be greater than minimum salary');
      }

      // Ensure location data is present
      if (!formData.latitude || !formData.longitude) {
        if (!formData.location_text?.trim()) {
          throw new Error('Job location is required');
        }
      }

      const jobData: JobPostingData = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        description: formData.description.trim(),
        requirements: formData.requirements || [],
        benefits: formData.benefits || [],
        salary_min: formData.salary_min,
        salary_max: formData.salary_max,
        job_type: formData.job_type || 'full-time',
        category: formData.category,
        urgent: formData.urgent || false,
        featured: formData.featured || false,
        latitude: formData.latitude,
        longitude: formData.longitude,
        location_text: formData.location_text,
        location_source: formData.location_source || 'manual'
      };

      if (onSubmit) {
        onSubmit(jobData);
      }

      toast({
        title: "Job Posted Successfully!",
        description: "Your job posting has been created and will be reviewed before going live.",
      });

    } catch (error: any) {
      toast({
        title: "Error Posting Job",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Building className="h-6 w-6" />
            Post a New Job
          </CardTitle>
          <p className="text-muted-foreground">
            Create a job posting to find qualified candidates. Location will be auto-populated from your profile.
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Job Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Senior Rigger - Mining Operation"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  placeholder="e.g. BHP Iron Ore"
                  value={formData.company || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Job Category and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Job Category *</Label>
                <Select 
                  value={formData.category || ''} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="job_type">Job Type *</Label>
                <Select 
                  value={formData.job_type || 'full-time'} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, job_type: value as JobPostingData['job_type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary_min">Minimum Salary (AUD) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="salary_min"
                    type="number"
                    placeholder="80000"
                    className="pl-10"
                    value={formData.salary_min || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary_min: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salary_max">Maximum Salary (AUD) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="salary_max"
                    type="number"
                    placeholder="120000"
                    className="pl-10"
                    value={formData.salary_max || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary_max: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location Section - Auto-populated from user profile */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Job Location</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLocationManager(true)}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Update Location
                </Button>
              </div>
              
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  {locationStatus === 'loading' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                      Loading your location...
                    </div>
                  )}
                  
                  {locationStatus === 'loaded' && userLocation && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">
                            {formData.location_text || 'Location coordinates'}
                          </p>
                          {formData.latitude && formData.longitude && (
                            <p className="text-sm text-muted-foreground">
                              Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {formData.location_source === 'user_profile' ? 'From your profile' :
                               formData.location_source === 'manual' ? 'Manually entered' : 'Auto-detected'}
                            </Badge>
                            {formData.location_source === 'user_profile' && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Auto-populated
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          This location was automatically populated from your profile. You can update it if the job location is different from your primary location.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  
                  {locationStatus === 'manual' && (
                    <div className="space-y-3">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No location found in your profile. Please set the job location.
                        </AlertDescription>
                      </Alert>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowLocationManager(true)}
                        className="w-full"
                      >
                        <MapIcon className="w-4 h-4 mr-2" />
                        Set Job Location
                      </Button>
                    </div>
                  )}
                  
                  {locationStatus === 'error' && locationError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{locationError}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                className="min-h-[120px]"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            {/* Requirements */}
            <div className="space-y-3">
              <Label>Requirements</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a requirement (e.g. High Risk Work Licence)"
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requirements?.map((req, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {req}
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="ml-2 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <Label>Benefits</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a benefit (e.g. FIFO accommodation)"
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                />
                <Button type="button" onClick={addBenefit} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.benefits?.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {benefit}
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="ml-2 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Job Options */}
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.urgent || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, urgent: e.target.checked }))}
                  className="rounded border-border"
                />
                <span className="text-sm">Mark as urgent</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.featured || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="rounded border-border"
                />
                <span className="text-sm">Feature this job</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Posting Job...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Post Job
                  </>
                )}
              </Button>
              
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Location Permission Manager Modal */}
      {showLocationManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-md w-full">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Set Job Location</h3>
              <p className="text-sm text-muted-foreground">
                Update the location for this job posting
              </p>
            </div>
            <div className="p-4">
              <LocationPermissionManager
                onLocationChange={handleLocationChange}
                showManualEntry={true}
                allowSkip={false}
                title="Job Location"
                description="Set where this job is located to help candidates find relevant opportunities."
              />
            </div>
            <div className="p-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowLocationManager(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostJob;
