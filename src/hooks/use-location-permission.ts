import { useState, useEffect, useCallback } from 'react';
import { 
  getUserLocation, 
  checkGeolocationPermission,
  GeolocationData,
  watchPosition,
  clearPositionWatch
} from '@/utils/geolocation';

export interface LocationState {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  timestamp?: number;
  address?: string;
  isManual?: boolean;
}

export interface UseLocationPermissionOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
  requestOnMount?: boolean;
}

export interface UseLocationPermissionReturn {
  location: LocationState | null;
  permissionStatus: 'loading' | 'granted' | 'denied' | 'prompt' | 'unsupported';
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  clearLocation: () => void;
  setManualLocation: (address: string) => void;
  retryLocation: () => Promise<void>;
}

export const useLocationPermission = (
  options: UseLocationPermissionOptions = {}
): UseLocationPermissionReturn => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000,
    watchPosition: enableWatch = false,
    requestOnMount = false
  } = options;

  const [location, setLocation] = useState<LocationState | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'loading' | 'granted' | 'denied' | 'prompt' | 'unsupported'>('loading');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Check initial permission status
  useEffect(() => {
    const checkInitialPermission = async () => {
      try {
        const status = await checkGeolocationPermission();
        setPermissionStatus(status === 'unsupported' ? 'unsupported' : status);
        
        if (requestOnMount && (status === 'granted' || status === 'prompt')) {
          await requestLocation();
        }
      } catch (err) {
        console.warn('Failed to check initial permission:', err);
        setPermissionStatus('prompt');
      }
    };

    checkInitialPermission();
  }, [requestOnMount]);

  // Setup position watching if enabled
  useEffect(() => {
    if (enableWatch && permissionStatus === 'granted' && !watchId) {
      const id = watchPosition(
        (position) => {
          setLocation({
            latitude: position.latitude,
            longitude: position.longitude,
            accuracy: position.accuracy,
            timestamp: position.timestamp,
            isManual: false
          });
          setError(null);
        },
        (err) => {
          setError(err.message);
        },
        {
          enableHighAccuracy,
          timeout: timeout * 2, // Longer timeout for watching
          maximumAge
        }
      );
      
      if (id !== null) {
        setWatchId(id);
      }
    }

    return () => {
      if (watchId !== null) {
        clearPositionWatch(watchId);
        setWatchId(null);
      }
    };
  }, [enableWatch, permissionStatus, watchId, enableHighAccuracy, timeout, maximumAge]);

  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getUserLocation({
        enableHighAccuracy,
        timeout,
        maximumAge
      });

      if (result.location) {
        setLocation({
          latitude: result.location.latitude,
          longitude: result.location.longitude,
          accuracy: result.location.accuracy,
          timestamp: result.location.timestamp,
          isManual: false
        });
        setPermissionStatus('granted');
      } else {
        setError(result.error || 'Failed to get location');
        if (result.requiresManualEntry) {
          setPermissionStatus('denied');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
      setPermissionStatus('denied');
    } finally {
      setIsLoading(false);
    }
  }, [enableHighAccuracy, timeout, maximumAge]);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
    
    if (watchId !== null) {
      clearPositionWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  const setManualLocation = useCallback((address: string) => {
    setLocation({
      address,
      isManual: true,
      timestamp: Date.now()
    });
    setError(null);
  }, []);

  const retryLocation = useCallback(async () => {
    clearLocation();
    await requestLocation();
  }, [clearLocation, requestLocation]);

  return {
    location,
    permissionStatus,
    isLoading,
    error,
    requestLocation,
    clearLocation,
    setManualLocation,
    retryLocation
  };
};
