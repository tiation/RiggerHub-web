import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export interface LocationSearchParams {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  searchTerm?: string;
  experienceLevel?: string;
  availability?: 'available' | 'busy' | 'all';
  sortBy?: 'distance' | 'experience' | 'match_score' | 'recent';
  limit?: number;
  offset?: number;
}

export interface WorkerSearchResult extends Tables<"profiles"> {
  distance?: number;
  match_score?: number;
  availability_status?: 'available' | 'busy' | 'unknown';
  last_active?: string;
}

// Haversine formula for calculating distance between two points
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculate a bounding box for efficient database queries
export const calculateBoundingBox = (
  latitude: number, 
  longitude: number, 
  radiusKm: number
): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} => {
  const R = 6371; // Earth's radius in kilometers
  const lat = latitude * Math.PI / 180;
  const lon = longitude * Math.PI / 180;
  
  // Angular distance
  const angular = radiusKm / R;
  
  const minLat = latitude - (angular * 180 / Math.PI);
  const maxLat = latitude + (angular * 180 / Math.PI);
  
  // Account for longitude convergence at high latitudes
  const deltaLon = Math.asin(Math.sin(angular) / Math.cos(lat)) * 180 / Math.PI;
  const minLon = longitude - deltaLon;
  const maxLon = longitude + deltaLon;
  
  return { minLat, maxLat, minLon, maxLon };
};

// Calculate match score based on search criteria
export const calculateMatchScore = (
  worker: Tables<"profiles">, 
  searchTerm: string = "",
  userLocation?: { latitude: number; longitude: number }
): number => {
  let score = 0;
  const searchTermLower = searchTerm.toLowerCase();
  
  // Text matching scores
  if (searchTerm) {
    if (worker.full_name?.toLowerCase().includes(searchTermLower)) score += 30;
    if (worker.position?.toLowerCase().includes(searchTermLower)) score += 25;
    if (worker.company?.toLowerCase().includes(searchTermLower)) score += 20;
    if (worker.bio?.toLowerCase().includes(searchTermLower)) score += 15;
    if (worker.location?.toLowerCase().includes(searchTermLower)) score += 10;
  }
  
  // Experience bonus
  if (worker.experience_years) {
    if (worker.experience_years >= 10) score += 15;
    else if (worker.experience_years >= 5) score += 10;
    else if (worker.experience_years >= 2) score += 5;
  }
  
  // Profile completeness bonus
  let completeness = 0;
  const fields = [
    worker.full_name,
    worker.position,
    worker.company,
    worker.bio,
    worker.phone,
    worker.location,
    worker.latitude && worker.longitude ? 'coordinates' : null
  ];
  completeness = fields.filter(Boolean).length;
  score += (completeness / 7) * 10; // Up to 10 points for completeness
  
  // Location proximity bonus (if user location is provided)
  if (userLocation && worker.latitude && worker.longitude) {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      worker.latitude,
      worker.longitude
    );
    
    // Proximity bonus: closer workers get higher scores
    if (distance <= 5) score += 10;
    else if (distance <= 15) score += 8;
    else if (distance <= 30) score += 5;
    else if (distance <= 50) score += 3;
  }
  
  return Math.min(100, Math.max(0, score));
};

// Search for workers with location-based filtering
export const searchWorkersNearLocation = async (
  params: LocationSearchParams
): Promise<{
  workers: WorkerSearchResult[];
  total: number;
  error?: string;
}> => {
  try {
    const {
      latitude,
      longitude,
      radiusKm = 50,
      searchTerm = "",
      experienceLevel,
      availability = 'all',
      sortBy = 'distance',
      limit = 20,
      offset = 0
    } = params;

    // Calculate bounding box for efficient filtering
    const bbox = calculateBoundingBox(latitude, longitude, radiusKm);
    
    // Build the query
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .gte('latitude', bbox.minLat)
      .lte('latitude', bbox.maxLat)
      .gte('longitude', bbox.minLon)
      .lte('longitude', bbox.maxLon);

    // Add text search if provided
    if (searchTerm) {
      query = query.or(`full_name.ilike.%${searchTerm}%,position.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
    }

    // Add experience level filter
    if (experienceLevel && experienceLevel !== 'all-experience') {
      switch (experienceLevel) {
        case 'entry':
          query = query.lt('experience_years', 2);
          break;
        case 'mid':
          query = query.gte('experience_years', 2).lt('experience_years', 5);
          break;
        case 'senior':
          query = query.gte('experience_years', 5).lt('experience_years', 10);
          break;
        case 'expert':
          query = query.gte('experience_years', 10);
          break;
      }
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Database query error:', error);
      return {
        workers: [],
        total: 0,
        error: 'Failed to search workers. Please try again.'
      };
    }

    // Process results with distance calculations and match scores
    const processedWorkers: WorkerSearchResult[] = (data || []).map(worker => {
      const distance = worker.latitude && worker.longitude 
        ? calculateDistance(latitude, longitude, worker.latitude, worker.longitude)
        : null;
      
      // Filter out workers outside the radius (more precise than bounding box)
      if (distance !== null && distance > radiusKm) {
        return null;
      }

      const match_score = calculateMatchScore(worker, searchTerm, { latitude, longitude });
      
      // Simulate availability status (in production, this would be a real database field)
      const availability_statuses: ('available' | 'busy' | 'unknown')[] = ['available', 'busy', 'unknown'];
      const availability_status = availability_statuses[Math.floor(Math.random() * 3)];
      
      // Simulate last active (in production, this would be tracked)
      const daysAgo = Math.floor(Math.random() * 30);
      const last_active = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

      return {
        ...worker,
        distance,
        match_score,
        availability_status,
        last_active
      };
    }).filter(Boolean) as WorkerSearchResult[];

    // Apply availability filter
    const filteredWorkers = availability === 'all' 
      ? processedWorkers
      : processedWorkers.filter(w => w.availability_status === availability);

    // Sort results
    filteredWorkers.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (a.distance !== null && b.distance !== null) {
            return a.distance - b.distance;
          }
          return 0;
        case 'experience':
          return (b.experience_years || 0) - (a.experience_years || 0);
        case 'match_score':
          return (b.match_score || 0) - (a.match_score || 0);
        case 'recent':
          if (a.last_active && b.last_active) {
            return new Date(b.last_active).getTime() - new Date(a.last_active).getTime();
          }
          return 0;
        default:
          return 0;
      }
    });

    return {
      workers: filteredWorkers,
      total: filteredWorkers.length,
    };

  } catch (error) {
    console.error('Error in searchWorkersNearLocation:', error);
    return {
      workers: [],
      total: 0,
      error: 'An unexpected error occurred while searching for workers.'
    };
  }
};

// Get workers within a specific radius (for basic radius search)
export const getWorkersInRadius = async (
  latitude: number,
  longitude: number,
  radiusKm: number,
  limit: number = 50
): Promise<WorkerSearchResult[]> => {
  const result = await searchWorkersNearLocation({
    latitude,
    longitude,
    radiusKm,
    limit
  });
  
  return result.workers;
};

// Future PostGIS integration helpers
export const buildPostGISQuery = (
  latitude: number,
  longitude: number,
  radiusKm: number
): string => {
  // This would be used when PostGIS is available in Supabase
  return `
    SELECT *, 
           ST_Distance(
             ST_GeomFromText('POINT(${longitude} ${latitude})', 4326),
             ST_GeomFromText('POINT(' || longitude || ' ' || latitude || ')', 4326)
           ) * 111.32 as distance_km
    FROM profiles 
    WHERE ST_DWithin(
      ST_GeomFromText('POINT(' || longitude || ' ' || latitude || ')', 4326),
      ST_GeomFromText('POINT(${longitude} ${latitude})', 4326),
      ${radiusKm / 111.32}
    )
    AND latitude IS NOT NULL 
    AND longitude IS NOT NULL
    ORDER BY distance_km;
  `;
};

// Enhanced location-based search with multiple criteria
export interface AdvancedSearchParams extends LocationSearchParams {
  skills?: string[];
  companies?: string[];
  minExperience?: number;
  maxExperience?: number;
  hasPhone?: boolean;
  hasLocation?: boolean;
  lastActiveDays?: number;
}

export const advancedWorkerSearch = async (
  params: AdvancedSearchParams
): Promise<{
  workers: WorkerSearchResult[];
  total: number;
  facets?: {
    locations: { [key: string]: number };
    companies: { [key: string]: number };
    experienceLevels: { [key: string]: number };
  };
  error?: string;
}> => {
  // This would implement more advanced search features
  // For now, delegate to the basic search
  const basicResult = await searchWorkersNearLocation(params);
  
  // Calculate facets for better UX
  const facets = {
    locations: {} as { [key: string]: number },
    companies: {} as { [key: string]: number },
    experienceLevels: {} as { [key: string]: number }
  };
  
  basicResult.workers.forEach(worker => {
    // Location facets
    if (worker.location) {
      facets.locations[worker.location] = (facets.locations[worker.location] || 0) + 1;
    }
    
    // Company facets
    if (worker.company) {
      facets.companies[worker.company] = (facets.companies[worker.company] || 0) + 1;
    }
    
    // Experience level facets
    const exp = worker.experience_years || 0;
    const level = exp < 2 ? 'Entry' : exp < 5 ? 'Mid' : exp < 10 ? 'Senior' : 'Expert';
    facets.experienceLevels[level] = (facets.experienceLevels[level] || 0) + 1;
  });
  
  return {
    ...basicResult,
    facets
  };
};

// Export from the new geocoding service for backward compatibility
export { reverseGeocode, geocodeAddress, formatDistance } from './geocoding';
