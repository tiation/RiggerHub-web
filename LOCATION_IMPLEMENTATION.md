# Location Coordinate Storage Implementation

## Overview
This implementation adds automatic location detection and coordinate storage during the user signup process. Users' latitude and longitude coordinates are now stored in the database alongside their profile information, enabling better job matching and location-based features.

## Changes Made

### 1. Database Schema Updates
- **File**: `supabase/migrations/20250123000001-add-location-coordinates.sql`
- Added `latitude` and `longitude` columns to the `profiles` table
- Updated the `handle_new_user()` trigger function to store coordinates from user metadata
- Added proper data type constraints (DECIMAL(10, 8) for latitude, DECIMAL(11, 8) for longitude)

### 2. TypeScript Type Updates
- **File**: `src/integrations/supabase/types.ts`
- Added `latitude` and `longitude` fields to the `profiles` table types
- Updated Row, Insert, and Update interfaces to include coordinate fields

### 3. Frontend Signup Integration
- **File**: `src/pages/Auth.tsx`
- Added automatic location detection during signup process
- Enhanced location input field with detection button and status indicators
- Integrated with existing geolocation utilities (`src/utils/geolocation.ts`)
- Added coordinate storage in user metadata during signup

### 4. UI Enhancements
- Location detection button with loading states
- Visual feedback for successful/failed location detection
- Display of detected coordinates for user confirmation
- Graceful fallback to manual location entry

## Features

### Automatic Location Detection
- Uses browser's geolocation API with comprehensive error handling
- Stores precise latitude/longitude coordinates in the database
- Updates location text field with coordinates if no manual location is provided
- Provides user feedback throughout the detection process

### Privacy & User Control
- Location detection is optional and user-initiated
- Users can still manually enter location information
- Clear indication when coordinates are detected and stored
- Respects browser permission settings for geolocation

### Database Storage
- Coordinates stored in user metadata during signup
- Automatically transferred to profile table via database trigger
- Proper data types ensure coordinate precision
- Backward compatible with existing profiles without coordinates

## To Apply This Implementation

### 1. Apply Database Migration
Run the following SQL in your Supabase dashboard or via CLI:

```sql
-- File: supabase/migrations/20250123000001-add-location-coordinates.sql

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
```

### 2. Update Frontend Dependencies
Ensure all updated TypeScript files are deployed:
- `src/integrations/supabase/types.ts`
- `src/pages/Auth.tsx`

### 3. Test the Implementation
1. Navigate to the signup page
2. Click "Detect My Location" button
3. Allow location access when prompted
4. Verify coordinates are displayed
5. Complete signup process
6. Check database to confirm coordinates are stored

## Usage

### For New Users
- During signup, users can click the "Detect My Location" button
- Browser will request location permissions
- If granted, coordinates are automatically detected and stored
- Users can still manually enter location text
- Both text location and coordinates are saved to the database

### For Developers
```typescript
// Coordinates are now available in profile data
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', userId)
  .single();

console.log('User coordinates:', {
  latitude: profile.latitude,
  longitude: profile.longitude,
  location: profile.location
});
```

## Benefits

1. **Enhanced Job Matching**: Precise coordinates enable accurate distance calculations for job recommendations
2. **Better User Experience**: Automatic location detection reduces signup friction
3. **Flexible Storage**: Both human-readable location text and precise coordinates are stored
4. **Privacy-Compliant**: Location detection is optional and user-controlled
5. **Backward Compatible**: Existing users without coordinates continue to work normally

## Security & Privacy

- Location detection requires explicit user permission
- Coordinates are only stored if successfully detected
- No location tracking or continuous monitoring
- Users maintain full control over their location data
- Complies with geolocation API privacy standards

## Future Enhancements

- Reverse geocoding to convert coordinates to readable addresses
- Location-based job filtering and sorting
- Distance calculations for job recommendations
- Location update functionality for existing users
- Privacy settings for location sharing preferences
