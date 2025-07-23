import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Edit, Check, X, Loader2, Navigation } from 'lucide-react';
import { reverseGeocode, formatDistance, estimateTravelTime } from '@/utils/geocoding';
import { useToast } from '@/hooks/use-toast';

export interface LocationDisplayProps {
  /** Latitude coordinate */
  latitude?: number | null;
  /** Longitude coordinate */
  longitude?: number | null;
  /** Manual address override */
  address?: string | null;
  /** Distance from user's location (if available) */
  distance?: number | null;
  /** Show distance and travel time estimates */
  showDistance?: boolean;
  /** Allow editing the location */
  editable?: boolean;
  /** Callback when location is manually updated */
  onLocationUpdate?: (address: string) => void;
  /** Display mode: inline, card, or badge */
  variant?: 'inline' | 'card' | 'badge';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({
  latitude,
  longitude,
  address,
  distance,
  showDistance = false,
  editable = false,
  onLocationUpdate,
  variant = 'inline',
  size = 'md',
  className = ''
}) => {
  const [displayAddress, setDisplayAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load and format the address
  useEffect(() => {
    const loadAddress = async () => {
      // If manual address is provided, use it
      if (address) {
        setDisplayAddress(address);
        setEditValue(address);
        return;
      }

      // If coordinates are available, reverse geocode them
      if (latitude && longitude) {
        setIsLoading(true);
        setError(null);
        
        try {
          const geocodedAddress = await reverseGeocode(latitude, longitude);
          setDisplayAddress(geocodedAddress);
          setEditValue(geocodedAddress);
        } catch (error) {
          console.error('Failed to reverse geocode:', error);
          setError('Failed to load location');
          setDisplayAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setEditValue(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsLoading(false);
        }
      } else {
        setDisplayAddress('Location not specified');
        setEditValue('');
      }
    };

    loadAddress();
  }, [latitude, longitude, address]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      setDisplayAddress(editValue.trim());
      onLocationUpdate?.(editValue.trim());
      setIsEditing(false);
      toast({
        title: 'Location Updated',
        description: 'Location has been updated successfully.',
      });
    }
  };

  const handleCancel = () => {
    setEditValue(displayAddress);
    setIsEditing(false);
  };

  // Size-based styling
  const sizeClasses = {
    sm: {
      text: 'text-xs',
      icon: 'w-3 h-3',
      spacing: 'space-x-1',
      padding: 'px-2 py-1'
    },
    md: {
      text: 'text-sm',
      icon: 'w-4 h-4',
      spacing: 'space-x-2',
      padding: 'px-3 py-2'
    },
    lg: {
      text: 'text-base',
      icon: 'w-5 h-5',
      spacing: 'space-x-2',
      padding: 'px-4 py-3'
    }
  };

  const styles = sizeClasses[size];

  // Render editing interface
  if (isEditing) {
    return (
      <div className={`flex items-center ${styles.spacing} ${className}`}>
        <MapPin className={`${styles.icon} text-muted-foreground flex-shrink-0`} />
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="Enter location..."
          className={`flex-1 ${styles.text}`}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
        <Button size="sm" variant="ghost" onClick={handleSave} className="p-1">
          <Check className="w-3 h-3 text-green-600" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel} className="p-1">
          <X className="w-3 h-3 text-red-600" />
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center ${styles.spacing} ${styles.text} text-muted-foreground ${className}`}>
        <Loader2 className={`${styles.icon} animate-spin`} />
        <span>Loading location...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center ${styles.spacing} ${styles.text} text-destructive ${className}`}>
        <MapPin className={styles.icon} />
        <span>{error}</span>
        {editable && (
          <Button size="sm" variant="ghost" onClick={handleEdit} className="p-1 ml-2">
            <Edit className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  // Render different variants
  switch (variant) {
    case 'badge':
      return (
        <Badge variant="secondary" className={`${styles.text} ${className}`}>
          <MapPin className={`${styles.icon} mr-1`} />
          {displayAddress}
          {showDistance && distance && (
            <span className="ml-1">• {formatDistance(distance)}</span>
          )}
          {editable && (
            <Button size="sm" variant="ghost" onClick={handleEdit} className="p-0 ml-1 h-auto">
              <Edit className="w-2 h-2" />
            </Button>
          )}
        </Badge>
      );

    case 'card':
      return (
        <Card className={className}>
          <CardContent className={styles.padding}>
            <div className={`flex items-start justify-between ${styles.spacing}`}>
              <div className={`flex items-center ${styles.spacing} flex-1`}>
                <MapPin className={`${styles.icon} text-primary flex-shrink-0`} />
                <div className="flex-1">
                  <div className={`${styles.text} font-medium`}>{displayAddress}</div>
                  {showDistance && distance && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistance(distance)} away • {estimateTravelTime(distance)} drive
                    </div>
                  )}
                </div>
              </div>
              {editable && (
                <Button size="sm" variant="ghost" onClick={handleEdit} className="p-1">
                  <Edit className="w-3 h-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );

    default: // inline
      return (
        <div className={`flex items-center ${styles.spacing} ${styles.text} ${className}`}>
          <MapPin className={`${styles.icon} text-muted-foreground flex-shrink-0`} />
          <span className="flex-1">{displayAddress}</span>
          {showDistance && distance && (
            <Badge variant="outline" className="text-xs ml-2">
              {formatDistance(distance)}
            </Badge>
          )}
          {editable && (
            <Button size="sm" variant="ghost" onClick={handleEdit} className="p-1 ml-2">
              <Edit className="w-3 h-3" />
            </Button>
          )}
        </div>
      );
  }
};

export default LocationDisplay;
