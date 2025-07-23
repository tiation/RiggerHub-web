export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export const GEOLOCATION_ERRORS = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
} as const;

export const getGeolocationErrorMessage = (error: GeolocationPositionError): string => {
  switch (error.code) {
    case GEOLOCATION_ERRORS.PERMISSION_DENIED:
      return "Location access was denied. Please enable location services and try again.";
    case GEOLOCATION_ERRORS.POSITION_UNAVAILABLE:
      return "Location information is unavailable. Please check your internet connection.";
    case GEOLOCATION_ERRORS.TIMEOUT:
      return "Location request timed out. Please try again.";
    default:
      return "An unknown error occurred while getting your location.";
  }
};

export const getCurrentPosition = (options?: PositionOptions): Promise<GeolocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: -1,
        message: "Geolocation is not supported by this browser."
      });
      return;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 5 * 60 * 1000, // 5 minutes
    };

    const finalOptions = { ...defaultOptions, ...options };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        reject({
          code: error.code,
          message: getGeolocationErrorMessage(error)
        });
      },
      finalOptions
    );
  });
};

// Convert coordinates to a readable location string (basic implementation)
// In a production app, you might want to use a reverse geocoding service
export const coordinatesToLocationString = (latitude: number, longitude: number): string => {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
};

// Check if geolocation is supported
export const isGeolocationSupported = (): boolean => {
  return 'geolocation' in navigator;
};

// Check geolocation permission status
export const checkGeolocationPermission = async (): Promise<PermissionState | 'unsupported'> => {
  if (!isGeolocationSupported()) {
    return 'unsupported';
  }

  if (!('permissions' in navigator)) {
    // Fallback for browsers without permissions API
    return 'prompt';
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state;
  } catch (error) {
    console.warn('Permission API query failed:', error);
    return 'prompt';
  }
};

// Request geolocation permission with user-friendly prompts
export const requestGeolocationPermission = async (options?: PositionOptions): Promise<GeolocationData> => {
  const permissionStatus = await checkGeolocationPermission();
  
  if (permissionStatus === 'unsupported') {
    throw {
      code: -1,
      message: 'Geolocation is not supported by this browser.'
    };
  }
  
  if (permissionStatus === 'denied') {
    throw {
      code: GEOLOCATION_ERRORS.PERMISSION_DENIED,
      message: getGeolocationErrorMessage({ code: GEOLOCATION_ERRORS.PERMISSION_DENIED } as GeolocationPositionError)
    };
  }

  return getCurrentPosition(options);
};

// Watch position with permission handling
export const watchPosition = (
  onSuccess: (position: GeolocationData) => void,
  onError: (error: LocationError) => void,
  options?: PositionOptions
): number | null => {
  if (!isGeolocationSupported()) {
    onError({
      code: -1,
      message: 'Geolocation is not supported by this browser.'
    });
    return null;
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 15000, // 15 seconds for watch
    maximumAge: 60 * 1000, // 1 minute for watch
  };

  const finalOptions = { ...defaultOptions, ...options };

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      onError({
        code: error.code,
        message: getGeolocationErrorMessage(error)
      });
    },
    finalOptions
  );
};

// Clear position watch
export const clearPositionWatch = (watchId: number): void => {
  if (navigator.geolocation && watchId) {
    navigator.geolocation.clearWatch(watchId);
  }
};

// Reverse geocoding placeholder (would integrate with a real service in production)
export const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  // This is a placeholder implementation
  // In production, you would integrate with a service like Google Maps, Mapbox, or OpenStreetMap
  try {
    // For now, return coordinates as fallback
    return coordinatesToLocationString(latitude, longitude);
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return coordinatesToLocationString(latitude, longitude);
  }
};

// Get user's location with comprehensive error handling and fallback options
export const getUserLocation = async (options?: {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  showPrompt?: boolean;
}): Promise<{ location: GeolocationData | null; requiresManualEntry: boolean; error?: string }> => {
  const { enableHighAccuracy = true, timeout = 10000, maximumAge = 300000, showPrompt = true } = options || {};
  
  try {
    const permissionStatus = await checkGeolocationPermission();
    
    if (permissionStatus === 'unsupported') {
      return {
        location: null,
        requiresManualEntry: true,
        error: 'Geolocation is not supported by your browser. Please enter your location manually.'
      };
    }
    
    if (permissionStatus === 'denied') {
      return {
        location: null,
        requiresManualEntry: true,
        error: 'Location access was denied. Please enable location services or enter your location manually.'
      };
    }

    const position = await getCurrentPosition({
      enableHighAccuracy,
      timeout,
      maximumAge
    });
    
    return {
      location: position,
      requiresManualEntry: false
    };
    
  } catch (error: any) {
    let requiresManualEntry = true;
    let errorMessage = 'Failed to get your location.';
    
    switch (error.code) {
      case GEOLOCATION_ERRORS.PERMISSION_DENIED:
        errorMessage = 'Location access was denied. Please enable location services or enter your location manually.';
        break;
      case GEOLOCATION_ERRORS.POSITION_UNAVAILABLE:
        errorMessage = 'Your location is currently unavailable. Please check your internet connection or try again.';
        requiresManualEntry = true;
        break;
      case GEOLOCATION_ERRORS.TIMEOUT:
        errorMessage = 'Location request timed out. Please try again or enter your location manually.';
        requiresManualEntry = true;
        break;
      default:
        errorMessage = error.message || 'An unknown error occurred while getting your location.';
    }
    
    return {
      location: null,
      requiresManualEntry,
      error: errorMessage
    };
  }
};
