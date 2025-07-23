// Geocoding service with multiple provider support
export interface GeocodingProvider {
  name: string;
  reverseGeocode: (lat: number, lng: number) => Promise<string | null>;
  geocode?: (address: string) => Promise<{ lat: number; lng: number } | null>;
}

// OpenCage Data API (free tier available)
const OPENCAGE_API_KEY = process.env.VITE_OPENCAGE_API_KEY;

const openCageProvider: GeocodingProvider = {
  name: 'OpenCage',
  reverseGeocode: async (lat: number, lng: number): Promise<string | null> => {
    if (!OPENCAGE_API_KEY) {
      console.warn('OpenCage API key not configured');
      return null;
    }
    
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${OPENCAGE_API_KEY}&language=en&pretty=1&no_annotations=1`
      );
      
      if (!response.ok) throw new Error('OpenCage API request failed');
      
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return result.formatted || null;
      }
      return null;
    } catch (error) {
      console.error('OpenCage reverse geocoding failed:', error);
      return null;
    }
  }
};

// Nominatim (OpenStreetMap) - Free service
const nominatimProvider: GeocodingProvider = {
  name: 'Nominatim',
  reverseGeocode: async (lat: number, lng: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RiggerConnect-App/1.0'
          }
        }
      );
      
      if (!response.ok) throw new Error('Nominatim API request failed');
      
      const data = await response.json();
      if (data.display_name) {
        // Format the address nicely for Australian locations
        const address = data.address;
        if (address) {
          const parts = [];
          if (address.house_number && address.road) {
            parts.push(`${address.house_number} ${address.road}`);
          } else if (address.road) {
            parts.push(address.road);
          }
          if (address.suburb || address.neighbourhood) {
            parts.push(address.suburb || address.neighbourhood);
          }
          if (address.city || address.town) {
            parts.push(address.city || address.town);
          }
          if (address.state) {
            parts.push(address.state);
          }
          
          return parts.length > 0 ? parts.join(', ') : data.display_name;
        }
        return data.display_name;
      }
      return null;
    } catch (error) {
      console.error('Nominatim reverse geocoding failed:', error);
      return null;
    }
  }
};

// Fallback provider for basic coordinate display
const coordinateProvider: GeocodingProvider = {
  name: 'Coordinates',
  reverseGeocode: async (lat: number, lng: number): Promise<string | null> => {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

// Available providers in priority order
const providers: GeocodingProvider[] = [
  openCageProvider,
  nominatimProvider,
  coordinateProvider // Always works as fallback
];

/**
 * Convert coordinates to a readable address using multiple providers
 * @param lat Latitude
 * @param lng Longitude
 * @param preferredProvider Optional preferred provider name
 * @returns Promise resolving to formatted address string
 */
export const reverseGeocode = async (
  lat: number, 
  lng: number, 
  preferredProvider?: string
): Promise<string> => {
  // Try preferred provider first if specified
  if (preferredProvider) {
    const provider = providers.find(p => p.name === preferredProvider);
    if (provider) {
      try {
        const result = await provider.reverseGeocode(lat, lng);
        if (result) return result;
      } catch (error) {
        console.warn(`Preferred provider ${preferredProvider} failed:`, error);
      }
    }
  }
  
  // Try all providers in order
  for (const provider of providers) {
    if (preferredProvider && provider.name === preferredProvider) {
      continue; // Already tried above
    }
    
    try {
      const result = await provider.reverseGeocode(lat, lng);
      if (result) {
        console.log(`Successfully geocoded using ${provider.name}`);
        return result;
      }
    } catch (error) {
      console.warn(`Provider ${provider.name} failed:`, error);
    }
  }
  
  // Ultimate fallback
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};

/**
 * Convert address to coordinates (forward geocoding)
 * Currently only implemented for Nominatim
 */
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=au`,
      {
        headers: {
          'User-Agent': 'RiggerConnect-App/1.0'
        }
      }
    );
    
    if (!response.ok) throw new Error('Geocoding request failed');
    
    const data = await response.json();
    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Forward geocoding failed:', error);
    return null;
  }
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
};

/**
 * Calculate approximate travel time (basic estimation)
 */
export const estimateTravelTime = (distanceKm: number, mode: 'driving' | 'walking' = 'driving'): string => {
  const speed = mode === 'driving' ? 50 : 5; // km/h
  const timeHours = distanceKm / speed;
  
  if (timeHours < 1) {
    return `${Math.round(timeHours * 60)} min`;
  } else {
    const hours = Math.floor(timeHours);
    const minutes = Math.round((timeHours - hours) * 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};
