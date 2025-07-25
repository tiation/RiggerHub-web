import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Navigation, 
  Shield,
  RefreshCw,
  MapIcon
} from 'lucide-react';
import { getCurrentPosition, isGeolocationSupported, GEOLOCATION_ERRORS } from '@/utils/geolocation';

export interface LocationData {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  timestamp?: number;
  address?: string;
  isManual?: boolean;
}

export interface LocationPermissionManagerProps {
  onLocationChange: (location: LocationData | null) => void;
  onPermissionChange?: (status: 'granted' | 'denied' | 'prompt' | 'unsupported') => void;
  showManualEntry?: boolean;
  allowSkip?: boolean;
  title?: string;
  description?: string;
  className?: string;
}

export type LocationPermissionStatus = 'loading' | 'granted' | 'denied' | 'prompt' | 'unsupported' | 'error';

const LocationPermissionManager: React.FC<LocationPermissionManagerProps> = ({
  onLocationChange,
  onPermissionChange,
  showManualEntry = true,
  allowSkip = false,
  title = "Location Access",
  description = "We need your location to show relevant results and improve your experience.",
  className = ""
}) => {
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('loading');
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  const waRegions = [
    'Perth Metro',
    'Pilbara',
    'Goldfields',
    'Kimberley',
    'Southwest', 
    'Great Southern',
    'Wheatbelt',
    'Mid West',
    'Gascoyne',
    'Other'
  ];

  // Check permission status on mount
  useEffect(() => {
    checkLocationPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notify parent of permission changes
  useEffect(() => {
    if (onPermissionChange && permissionStatus !== 'loading') {
      const status = permissionStatus === 'error' ? 'denied' : permissionStatus;
      onPermissionChange(status as 'granted' | 'denied' | 'prompt' | 'unsupported');
    }
  }, [permissionStatus, onPermissionChange]);

  // Notify parent of location changes
  useEffect(() => {
    onLocationChange(currentLocation);
  }, [currentLocation, onLocationChange]);

  const checkLocationPermission = async () => {
    if (!isGeolocationSupported()) {
      setPermissionStatus('unsupported');
      setErrorMessage('Geolocation is not supported by your browser. Please enter your location manually.');
      if (showManualEntry) {
        setShowManualForm(true);
      }
      return;
    }

    try {
      // Check if permissions API is available
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(permission.state as LocationPermissionStatus);
        
        // Listen for permission changes
        permission.onchange = () => {
          setPermissionStatus(permission.state as LocationPermissionStatus);
          if (permission.state === 'granted') {
            detectLocation();
          }
        };
      } else {
        // Fallback for browsers without permissions API
        setPermissionStatus('prompt');
      }
    } catch (error) {
      console.warn('Permission API not available:', error);
      setPermissionStatus('prompt');
    }
  };

  const requestLocationPermission = async () => {
    setIsDetecting(true);
    setErrorMessage('');
    
    try {
      const position = await getCurrentPosition();
      setCurrentLocation({
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        timestamp: position.timestamp,
        isManual: false
      });
      setPermissionStatus('granted');
    } catch (error: unknown) {
      setIsDetecting(false);
      handleLocationError(error);
    } finally {
      setIsDetecting(false);
    }
  };

  const detectLocation = async () => {
    if (permissionStatus !== 'granted') return;
    
    setIsDetecting(true);
    setErrorMessage('');
    
    try {
      const position = await getCurrentPosition();
      setCurrentLocation({
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        timestamp: position.timestamp,
        isManual: false
      });
    } catch (error: unknown) {
      handleLocationError(error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleLocationError = (error: unknown) => {
    setPermissionStatus('error');
    
    let message = 'Failed to get your location';
    
    if (error && typeof error === 'object' && 'message' in error) {
      message = (error as { message: string }).message;
    }
    
    const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: number }).code : undefined;
    
    switch (errorCode) {
      case GEOLOCATION_ERRORS.PERMISSION_DENIED:
        message = 'Location access was denied. You can manually enter your location below or enable location services in your browser settings.';
        break;
      case GEOLOCATION_ERRORS.POSITION_UNAVAILABLE:
        message = 'Your location is currently unavailable. Please check your internet connection or enter your location manually.';
        break;
      case GEOLOCATION_ERRORS.TIMEOUT:
        message = 'Location request timed out. Please try again or enter your location manually.';
        break;
    }
    
    setErrorMessage(message);
    
    if (showManualEntry) {
      setShowManualForm(true);
    }
  };

  const handleManualLocationSubmit = () => {
    if (!manualAddress.trim() && !selectedRegion) {
      setErrorMessage('Please enter an address or select a region.');
      return;
    }

    const location: LocationData = {
      address: manualAddress.trim() || selectedRegion,
      isManual: true,
      timestamp: Date.now()
    };

    setCurrentLocation(location);
    setErrorMessage('');
    setShowManualForm(false);
  };

  const resetLocation = () => {
    setCurrentLocation(null);
    setErrorMessage('');
    setShowManualForm(false);
    setManualAddress('');
    setSelectedRegion('');
    checkLocationPermission();
  };

  const skipLocation = () => {
    setCurrentLocation(null);
    onLocationChange(null);
  };

  const renderPermissionPrompt = () => (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <MapPin className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-center">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permissionStatus === 'unsupported' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your browser doesn't support automatic location detection. Please enter your location manually below.
            </AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {permissionStatus !== 'unsupported' && (
          <Button 
            onClick={requestLocationPermission} 
            disabled={isDetecting}
            className="w-full"
          >
            {isDetecting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Detecting Location...
              </>
            ) : (
              <>
                <Navigation className="mr-2 h-4 w-4" />
                Allow Location Access
              </>
            )}
          </Button>
        )}

        {showManualEntry && (
          <Button 
            variant="outline" 
            onClick={() => setShowManualForm(true)}
            className="w-full"
          >
            <MapIcon className="mr-2 h-4 w-4" />
            Enter Location Manually
          </Button>
        )}

        {allowSkip && (
          <Button 
            variant="ghost" 
            onClick={skipLocation}
            className="w-full text-muted-foreground"
          >
            Skip for now
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const renderManualEntry = () => (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapIcon className="h-5 w-5" />
          Enter Your Location
        </CardTitle>
        <CardDescription>
          Please provide your location to get relevant results
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="manual-address">Street Address or Suburb</Label>
          <Input
            id="manual-address"
            placeholder="e.g. 123 Main Street, Perth"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="region-select">Or Select a Region</Label>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a region..." />
            </SelectTrigger>
            <SelectContent>
              {waRegions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleManualLocationSubmit} className="flex-1">
            Confirm Location
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowManualForm(false)}
          >
            Cancel
          </Button>
        </div>

        {permissionStatus !== 'unsupported' && (
          <Button 
            variant="ghost" 
            onClick={requestLocationPermission}
            disabled={isDetecting}
            className="w-full text-sm"
          >
            Try automatic detection again
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const renderLocationDisplay = () => (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success" />
          Location Confirmed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
          <MapPin className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            {currentLocation?.address ? (
              <div>
                <p className="font-medium">{currentLocation.address}</p>
                <Badge variant="secondary" className="mt-1">
                  {currentLocation.isManual ? 'Manually entered' : 'Auto-detected'}
                </Badge>
              </div>
            ) : (
              <div>
                <p className="font-medium">
                  {currentLocation?.latitude?.toFixed(4)}, {currentLocation?.longitude?.toFixed(4)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Accuracy: ±{currentLocation?.accuracy?.toFixed(0)}m
                </p>
                <Badge variant="secondary" className="mt-1">
                  Auto-detected
                </Badge>
              </div>
            )}
          </div>
        </div>

        <Button variant="outline" onClick={resetLocation} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Change Location
        </Button>
      </CardContent>
    </Card>
  );

  // Render based on current state
  if (currentLocation) {
    return renderLocationDisplay();
  }

  if (showManualForm) {
    return renderManualEntry();
  }

  return renderPermissionPrompt();
};

export default LocationPermissionManager;
