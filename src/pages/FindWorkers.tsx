import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import LocationPermissionManager, { LocationData } from "@/components/ui/location-permission-manager";
import { useLocationPermission } from "@/hooks/use-location-permission";
import { 
  MapPin, 
  Clock, 
  Building, 
  Search, 
  Bookmark, 
  Heart, 
  Star, 
  Navigation, 
  MapIcon, 
  AlertCircle,
  User,
  Award,
  Phone,
  Mail,
  Calendar,
  Filter,
  Users,
  TrendingUp,
  Target
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWorkerSearch } from "@/hooks/use-worker-search";
import { Link } from "react-router-dom";

const FindWorkers = () => {
  const [savedWorkers, setSavedWorkers] = useState<string[]>([]);
  const [showLocationManager, setShowLocationManager] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const { toast } = useToast();
  
  // Use the worker search hook
  const {
    workers,
    loading,
    error: searchError,
    total,
    stats,
    filters,
    updateSearchTerm,
    updateRadius,
    updateExperienceLevel,
    updateSortBy,
    updateFilters,
    clearSearch,
    loadMore,
    hasMore,
    canSearch
  } = useWorkerSearch({
    userLocation,
    initialRadius: 50,
    autoSearch: true,
    debounceMs: 500
  });
  
  // Use location permission hook for automatic detection
  const {
    location: detectedLocation,
    permissionStatus,
    isLoading: locationLoading,
    error: locationError,
    requestLocation,
    clearLocation
  } = useLocationPermission({});
  
  // Update user location when detected
  useEffect(() => {
    if (detectedLocation) {
      setUserLocation(detectedLocation);
    }
  }, [detectedLocation]);

  // The worker search logic is now handled by the useWorkerSearch hook
  const filteredWorkers = workers; // Results are already filtered and sorted by the hook

  const handleSaveWorker = (workerId: string) => {
    if (savedWorkers.includes(workerId)) {
      setSavedWorkers(prev => prev.filter(id => id !== workerId));
      toast({
        title: "Worker Unsaved",
        description: "Worker removed from your saved list.",
      });
    } else {
      setSavedWorkers(prev => [...prev, workerId]);
      toast({
        title: "Worker Saved",
        description: "Worker added to your saved list.",
      });
    }
  };

  const handleContact = (workerName: string) => {
    toast({
      title: "Contact Request",
      description: `Contact request sent to ${workerName}. They will be notified.`,
    });
  };

  // Handle location detection
  const handleLocationDetection = () => {
    setShowLocationManager(true);
  };

  const handleLocationChange = (location: LocationData | null) => {
    setUserLocation(location);
    setShowLocationManager(false);
    if (location) {
      toast({
        title: "Location Updated",
        description: location.address ? 
          `Location set to ${location.address}` : 
          "Location detected successfully",
      });
    }
  };

  // Stats are now provided by the hook
  const workerStats = stats;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumbs />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary-hover text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Find Skilled Workers</h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Connect with qualified riggers, doggers, crane operators, and other skilled workers across Western Australia.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{workerStats.total}</div>
                  <div className="text-white/80 text-sm">Total Workers</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-300">{workerStats.available}</div>
                  <div className="text-white/80 text-sm">Available</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-300">{workerStats.experienced}</div>
                  <div className="text-white/80 text-sm">Experienced (5+ yrs)</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-300">{workerStats.nearby}</div>
                  <div className="text-white/80 text-sm">Nearby (25km)</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Search & Filters */}
          <div className="mb-8">
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search workers by name, role, or company..."
                      value={filters.searchTerm}
                      onChange={(e) => updateSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filters.location} onValueChange={(value) => updateFilters({ location: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-locations">All Locations</SelectItem>
                      <SelectItem value="Perth">Perth</SelectItem>
                      <SelectItem value="Port Hedland">Port Hedland</SelectItem>
                      <SelectItem value="Kalgoorlie">Kalgoorlie</SelectItem>
                      <SelectItem value="Karratha">Karratha</SelectItem>
                      <SelectItem value="Tom Price">Tom Price</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.experienceLevel} onValueChange={updateExperienceLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Experience Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-experience">All Experience</SelectItem>
                      <SelectItem value="entry">Entry Level (0-2 yrs)</SelectItem>
                      <SelectItem value="mid">Mid Level (2-5 yrs)</SelectItem>
                      <SelectItem value="senior">Senior (5-10 yrs)</SelectItem>
                      <SelectItem value="expert">Expert (10+ yrs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <Button 
                      variant="outline" 
                      className="hover-scale" 
                      onClick={handleLocationDetection}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Detect My Location
                    </Button>
                    
                    {userLocation && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapIcon className="h-4 w-4" />
                        <span>
                          {userLocation.address || 
                           (userLocation.latitude && userLocation.longitude ? 
                            `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}` : 
                            'Location detected')}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {userLocation.isManual ? 'Manual' : 'Auto'}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setUserLocation(null)}
                          className="h-6 w-6 p-0 hover:bg-destructive/20"
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Distance Filter */}
                  {userLocation && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Search Radius</label>
                        <span className="text-sm text-muted-foreground">{filters.radiusKm} km</span>
                      </div>
                      <Slider
                        value={[filters.radiusKm]}
                        onValueChange={(value) => updateRadius(value[0])}
                        max={200}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  {locationError && (
                    <Alert className="max-w-md">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {locationError}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {filteredWorkers.length} Worker{filteredWorkers.length !== 1 ? 's' : ''} Found
              </h2>
              <p className="text-muted-foreground">
                Showing {filteredWorkers.length} of {workers.length} available workers
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={filters.sortBy} onValueChange={updateSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="match">Match Score</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="recent">Recently Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Workers List */}
          {loading ? (
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="flex space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-6 bg-muted rounded w-1/3"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredWorkers.map((worker) => (
                <Card key={worker.id} className="card-lift hover:shadow-lg transition-all duration-300 group animate-fade-in">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {worker.full_name?.charAt(0) || 'W'}
                        </div>
                        
                        {/* Worker Info */}
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2 hover:text-primary transition-colors cursor-pointer group-hover:text-primary">
                            {worker.full_name || 'Anonymous Worker'}
                          </CardTitle>
                          
                          <div className="flex items-center flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                            {worker.position && (
                              <div className="flex items-center space-x-1">
                                <Award className="w-4 h-4" />
                                <span className="font-medium">{worker.position}</span>
                              </div>
                            )}
                            {worker.company && (
                              <div className="flex items-center space-x-1">
                                <Building className="w-4 h-4" />
                                <span>{worker.company}</span>
                              </div>
                            )}
                            {worker.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{worker.location}</span>
                                {worker.distance && (
                                  <Badge variant="outline" className="text-xs ml-2">
                                    {worker.distance.toFixed(1)} km away
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center flex-wrap gap-2 mb-3">
                            {worker.experience_years && (
                              <Badge variant="secondary">
                                {worker.experience_years} years experience
                              </Badge>
                            )}
                            {worker.availability_status && (
                              <Badge 
                                variant={worker.availability_status === 'available' ? 'default' : 
                                        worker.availability_status === 'busy' ? 'destructive' : 'secondary'}
                                className={worker.availability_status === 'available' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                              >
                                {worker.availability_status}
                              </Badge>
                            )}
                            {worker.match_score && worker.match_score > 0 && (
                              <Badge variant="outline" className="text-primary">
                                {worker.match_score.toFixed(0)}% match
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2 min-w-[140px]">
                        <Button 
                          className="hover-scale btn-glow"
                          onClick={() => handleContact(worker.full_name || 'Worker')}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Contact
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover-scale"
                          onClick={() => handleSaveWorker(worker.id)}
                        >
                          <Heart className={`w-4 h-4 mr-2 ${savedWorkers.includes(worker.id) ? 'fill-current text-red-500' : ''}`} />
                          {savedWorkers.includes(worker.id) ? 'Saved' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {worker.bio && (
                      <p className="text-muted-foreground leading-relaxed">{worker.bio}</p>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {worker.last_active && (
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Active {new Date(worker.last_active).toLocaleDateString()}</span>
                          </span>
                        )}
                        {worker.phone && (
                          <span className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>Phone verified</span>
                          </span>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary-hover">
                        View Profile →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && filteredWorkers.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No Workers Found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find any workers matching your criteria. Try adjusting your search filters.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={clearSearch}>
                    Clear Filters
                  </Button>
                  <Button asChild>
                    <Link to="/post-job">Post a Job</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Load More / Recommendations */}
          {filteredWorkers.length > 0 && (
            <div className="mt-12">
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Need Help Finding Workers?</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Set up job alerts or contact our team for personalized recommendations 
                    to find the perfect workers for your project.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {hasMore && (
                      <Button 
                        variant="outline" 
                        className="hover-scale"
                        onClick={loadMore}
                        disabled={loading}
                      >
                        {loading ? 'Loading...' : 'Load More Workers'}
                      </Button>
                    )}
                    <Button className="btn-glow hover-scale" asChild>
                      <Link to="/contact">Get Help Finding Workers</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      {/* Location Permission Manager Modal */}
      {showLocationManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-md w-full">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Find Workers Near You</h3>
              <p className="text-sm text-muted-foreground">
                Allow location access to find workers in your area and see distance information
              </p>
            </div>
            <div className="p-4">
              <LocationPermissionManager
                onLocationChange={handleLocationChange}
                showManualEntry={true}
                allowSkip={true}
                title="Your Location"
                description="This helps us show you relevant workers nearby and calculate distances."
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
      
      <Footer />
    </div>
  );
};

export default FindWorkers;
