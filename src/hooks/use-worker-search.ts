import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  searchWorkersNearLocation, 
  WorkerSearchResult, 
  LocationSearchParams,
  advancedWorkerSearch,
  AdvancedSearchParams
} from '@/utils/location-search';

export interface UseWorkerSearchParams {
  userLocation?: { latitude: number; longitude: number } | null;
  initialRadius?: number;
  autoSearch?: boolean;
  debounceMs?: number;
}

export interface WorkerSearchState {
  workers: WorkerSearchResult[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  facets?: {
    locations: { [key: string]: number };
    companies: { [key: string]: number };
    experienceLevels: { [key: string]: number };
  };
}

export interface WorkerSearchFilters {
  searchTerm: string;
  radiusKm: number;
  experienceLevel: string;
  availability: 'available' | 'busy' | 'all';
  location: string;
  sortBy: 'distance' | 'experience' | 'match_score' | 'recent';
}

export const useWorkerSearch = (params: UseWorkerSearchParams = {}) => {
  const { 
    userLocation, 
    initialRadius = 50,
    autoSearch = true,
    debounceMs = 500
  } = params;

  const { toast } = useToast();

  // Search state
  const [searchState, setSearchState] = useState<WorkerSearchState>({
    workers: [],
    loading: false,
    error: null,
    total: 0,
    hasMore: false,
  });

  // Search filters
  const [filters, setFilters] = useState<WorkerSearchFilters>({
    searchTerm: '',
    radiusKm: initialRadius,
    experienceLevel: '',
    availability: 'all',
    location: '',
    sortBy: 'distance',
  });

  // Pagination
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
  });

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(filters.searchTerm);

  // Debounce search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(filters.searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [filters.searchTerm, debounceMs]);

  // Search function
  const performSearch = useCallback(async (
    searchFilters: WorkerSearchFilters,
    paginationOptions: { limit: number; offset: number },
    location?: { latitude: number; longitude: number } | null
  ) => {
    if (!location?.latitude || !location?.longitude) {
      return;
    }

    setSearchState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const searchParams: LocationSearchParams = {
        latitude: location.latitude,
        longitude: location.longitude,
        radiusKm: searchFilters.radiusKm,
        searchTerm: debouncedSearchTerm,
        experienceLevel: searchFilters.experienceLevel,
        availability: searchFilters.availability,
        sortBy: searchFilters.sortBy,
        limit: paginationOptions.limit,
        offset: paginationOptions.offset,
      };

      const result = await searchWorkersNearLocation(searchParams);

      if (result.error) {
        setSearchState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Search failed',
        }));
        
        toast({
          title: "Search Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      setSearchState(prev => ({
        ...prev,
        loading: false,
        workers: paginationOptions.offset === 0 
          ? result.workers 
          : [...prev.workers, ...result.workers],
        total: result.total,
        hasMore: result.workers.length === paginationOptions.limit,
        error: null,
      }));

    } catch (error) {
      console.error('Error in performSearch:', error);
      const errorMessage = 'An unexpected error occurred while searching for workers.';
      
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      toast({
        title: "Search Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [debouncedSearchTerm, toast]);

  // Advanced search function
  const performAdvancedSearch = useCallback(async (
    advancedParams: AdvancedSearchParams
  ) => {
    setSearchState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await advancedWorkerSearch(advancedParams);

      if (result.error) {
        setSearchState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Advanced search failed',
        }));
        
        toast({
          title: "Search Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      setSearchState(prev => ({
        ...prev,
        loading: false,
        workers: result.workers,
        total: result.total,
        hasMore: false, // Advanced search loads all results
        facets: result.facets,
        error: null,
      }));

    } catch (error) {
      console.error('Error in performAdvancedSearch:', error);
      const errorMessage = 'An unexpected error occurred during advanced search.';
      
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      toast({
        title: "Advanced Search Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  // Auto-search when dependencies change
  useEffect(() => {
    if (autoSearch && userLocation) {
      // Reset pagination on filter change
      setPagination(prev => ({ ...prev, offset: 0 }));
      performSearch(filters, { ...pagination, offset: 0 }, userLocation);
    }
  }, [
    autoSearch,
    userLocation,
    filters.radiusKm,
    filters.experienceLevel,
    filters.availability,
    filters.location,
    filters.sortBy,
    debouncedSearchTerm,
    performSearch
  ]);

  // Filter update functions
  const updateFilters = useCallback((newFilters: Partial<WorkerSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, offset: 0 })); // Reset pagination
  }, []);

  const updateSearchTerm = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

  const updateRadius = useCallback((radiusKm: number) => {
    setFilters(prev => ({ ...prev, radiusKm }));
  }, []);

  const updateExperienceLevel = useCallback((experienceLevel: string) => {
    setFilters(prev => ({ ...prev, experienceLevel }));
  }, []);

  const updateAvailability = useCallback((availability: 'available' | 'busy' | 'all') => {
    setFilters(prev => ({ ...prev, availability }));
  }, []);

  const updateSortBy = useCallback((sortBy: 'distance' | 'experience' | 'match_score' | 'recent') => {
    setFilters(prev => ({ ...prev, sortBy }));
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchState({
      workers: [],
      loading: false,
      error: null,
      total: 0,
      hasMore: false,
    });
    setFilters({
      searchTerm: '',
      radiusKm: initialRadius,
      experienceLevel: '',
      availability: 'all',
      location: '',
      sortBy: 'distance',
    });
    setPagination({ limit: 20, offset: 0 });
  }, [initialRadius]);

  // Load more results
  const loadMore = useCallback(() => {
    if (searchState.hasMore && !searchState.loading && userLocation) {
      const newOffset = pagination.offset + pagination.limit;
      setPagination(prev => ({ ...prev, offset: newOffset }));
      performSearch(filters, { ...pagination, offset: newOffset }, userLocation);
    }
  }, [
    searchState.hasMore,
    searchState.loading,
    userLocation,
    pagination,
    filters,
    performSearch
  ]);

  // Refresh search
  const refresh = useCallback(() => {
    if (userLocation) {
      setPagination(prev => ({ ...prev, offset: 0 }));
      performSearch(filters, { ...pagination, offset: 0 }, userLocation);
    }
  }, [userLocation, filters, pagination, performSearch]);

  // Manual search trigger
  const search = useCallback(() => {
    if (userLocation) {
      setPagination({ limit: 20, offset: 0 });
      performSearch(filters, { limit: 20, offset: 0 }, userLocation);
    }
  }, [userLocation, filters, performSearch]);

  // Get filtered stats
  const stats = useMemo(() => {
    if (!searchState.workers.length) {
      return {
        total: 0,
        available: 0,
        experienced: 0,
        nearby: 0
      };
    }

    return {
      total: searchState.total,
      available: searchState.workers.filter(w => w.availability_status === 'available').length,
      experienced: searchState.workers.filter(w => (w.experience_years || 0) >= 5).length,
      nearby: searchState.workers.filter(w => w.distance && w.distance <= 25).length
    };
  }, [searchState.workers, searchState.total]);

  return {
    // State
    ...searchState,
    filters,
    pagination,
    stats,
    
    // Actions
    updateFilters,
    updateSearchTerm,
    updateRadius,
    updateExperienceLevel,
    updateAvailability,
    updateSortBy,
    clearSearch,
    loadMore,
    refresh,
    search,
    performAdvancedSearch,
    
    // Computed
    hasLocation: Boolean(userLocation?.latitude && userLocation?.longitude),
    canSearch: Boolean(userLocation?.latitude && userLocation?.longitude),
  };
};
