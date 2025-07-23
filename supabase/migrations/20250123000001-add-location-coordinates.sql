-- Add latitude and longitude columns to profiles table for precise location tracking
ALTER TABLE public.profiles 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.latitude IS 'User location latitude coordinate (WGS84)';
COMMENT ON COLUMN public.profiles.longitude IS 'User location longitude coordinate (WGS84)';

-- Update the handle_new_user function to handle coordinate metadata
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    full_name,
    company,
    position,
    phone,
    location,
    latitude,
    longitude
  )
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'position',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'location',
    CASE 
      WHEN new.raw_user_meta_data->>'latitude' IS NOT NULL 
      THEN (new.raw_user_meta_data->>'latitude')::DECIMAL(10, 8)
      ELSE NULL
    END,
    CASE 
      WHEN new.raw_user_meta_data->>'longitude' IS NOT NULL 
      THEN (new.raw_user_meta_data->>'longitude')::DECIMAL(11, 8)
      ELSE NULL
    END
  );
  RETURN new;
END;
$$;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
