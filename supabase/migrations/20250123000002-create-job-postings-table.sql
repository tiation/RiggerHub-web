-- Create job_postings table for employers to post jobs with coordinate-based location data
CREATE TABLE public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  salary_min INTEGER,
  salary_max INTEGER,
  job_type TEXT NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'casual')),
  category TEXT NOT NULL,
  urgent BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  
  -- Location data - prioritize coordinates over text
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_text TEXT,
  location_source TEXT CHECK (location_source IN ('user_profile', 'manual', 'detected')) DEFAULT 'manual',
  
  -- Metadata
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Add comments for documentation
COMMENT ON COLUMN public.job_postings.latitude IS 'Job location latitude coordinate (WGS84)';
COMMENT ON COLUMN public.job_postings.longitude IS 'Job location longitude coordinate (WGS84)';
COMMENT ON COLUMN public.job_postings.location_text IS 'Human-readable location description (fallback if coordinates not available)';
COMMENT ON COLUMN public.job_postings.location_source IS 'Source of location data: user_profile (auto-populated), manual (user entered), detected (geolocation)';

-- Enable Row Level Security
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Employers can view their own job postings" 
ON public.job_postings 
FOR SELECT 
USING (auth.uid() = employer_id);

CREATE POLICY "Employers can create job postings" 
ON public.job_postings 
FOR INSERT 
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their own job postings" 
ON public.job_postings 
FOR UPDATE 
USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own job postings" 
ON public.job_postings 
FOR DELETE 
USING (auth.uid() = employer_id);

-- Public can view published job postings
CREATE POLICY "Public can view published job postings" 
ON public.job_postings 
FOR SELECT 
USING (status = 'published');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_job_postings_updated_at
BEFORE UPDATE ON public.job_postings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_job_postings_employer_id ON public.job_postings(employer_id);
CREATE INDEX idx_job_postings_status ON public.job_postings(status);
CREATE INDEX idx_job_postings_category ON public.job_postings(category);
CREATE INDEX idx_job_postings_coordinates ON public.job_postings(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_job_postings_created_at ON public.job_postings(created_at DESC);
CREATE INDEX idx_job_postings_location_text ON public.job_postings USING gin(to_tsvector('english', location_text)) WHERE location_text IS NOT NULL;

-- Create function to auto-populate location from user profile when creating job posting
CREATE OR REPLACE FUNCTION public.auto_populate_job_location()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- If no location data provided and location_source is 'user_profile', try to get from user profile
  IF (NEW.latitude IS NULL OR NEW.longitude IS NULL) AND NEW.location_source = 'user_profile' THEN
    SELECT latitude, longitude, location
    INTO NEW.latitude, NEW.longitude, NEW.location_text
    FROM public.profiles 
    WHERE user_id = NEW.employer_id;
    
    -- If we found coordinates but no location text, keep the existing location_text if any
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL AND NEW.location_text IS NULL THEN
      SELECT location
      INTO NEW.location_text
      FROM public.profiles 
      WHERE user_id = NEW.employer_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-populate location data on job creation
CREATE TRIGGER auto_populate_job_location_trigger
  BEFORE INSERT ON public.job_postings
  FOR EACH ROW 
  EXECUTE FUNCTION public.auto_populate_job_location();

-- Create function for distance-based job search
CREATE OR REPLACE FUNCTION public.find_jobs_within_distance(
  user_lat DECIMAL(10, 8),
  user_lng DECIMAL(11, 8),
  radius_km INTEGER DEFAULT 50,
  job_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  company TEXT,
  location_text TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  distance_km DECIMAL(10, 2),
  salary_min INTEGER,
  salary_max INTEGER,
  job_type TEXT,
  category TEXT,
  urgent BOOLEAN,
  featured BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    jp.id,
    jp.title,
    jp.company,
    jp.location_text,
    jp.latitude,
    jp.longitude,
    ROUND(
      (6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(jp.latitude)) * 
        cos(radians(jp.longitude) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(jp.latitude))
      ))::numeric, 2
    ) as distance_km,
    jp.salary_min,
    jp.salary_max,
    jp.job_type,
    jp.category,
    jp.urgent,
    jp.featured,
    jp.created_at
  FROM public.job_postings jp
  WHERE 
    jp.status = 'published'
    AND jp.latitude IS NOT NULL 
    AND jp.longitude IS NOT NULL
    AND (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(jp.latitude)) * 
        cos(radians(jp.longitude) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(jp.latitude))
      )
    ) <= radius_km
  ORDER BY distance_km ASC, jp.featured DESC, jp.urgent DESC, jp.created_at DESC
  LIMIT job_limit;
$$;

-- Grant necessary permissions
GRANT SELECT ON public.job_postings TO anon;
GRANT ALL ON public.job_postings TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_jobs_within_distance TO anon;
GRANT EXECUTE ON FUNCTION public.find_jobs_within_distance TO authenticated;
