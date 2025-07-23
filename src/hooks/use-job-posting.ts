import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { JobPostingData } from '@/components/PostJob';

export interface JobPosting extends JobPostingData {
  id: string;
  employer_id: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  published_at?: string;
  expires_at?: string;
}

export interface UseJobPostingResult {
  loading: boolean;
  error: string | null;
  createJobPosting: (jobData: JobPostingData) => Promise<JobPosting | null>;
  updateJobPosting: (id: string, jobData: Partial<JobPostingData>) => Promise<JobPosting | null>;
  publishJobPosting: (id: string) => Promise<boolean>;
  archiveJobPosting: (id: string) => Promise<boolean>;
  deleteJobPosting: (id: string) => Promise<boolean>;
  getUserJobPostings: () => Promise<JobPosting[]>;
  getJobPostingById: (id: string) => Promise<JobPosting | null>;
  findJobsNearLocation: (latitude: number, longitude: number, radiusKm?: number, limit?: number) => Promise<JobPosting[]>;
}

export const useJobPosting = (): UseJobPostingResult => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createJobPosting = useCallback(async (jobData: JobPostingData): Promise<JobPosting | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to create a job posting');
      }

      const jobPayload = {
        employer_id: user.id,
        title: jobData.title,
        company: jobData.company,
        description: jobData.description,
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        salary_min: jobData.salary_min,
        salary_max: jobData.salary_max,
        job_type: jobData.job_type,
        category: jobData.category,
        urgent: jobData.urgent,
        featured: jobData.featured,
        latitude: jobData.latitude,
        longitude: jobData.longitude,
        location_text: jobData.location_text,
        location_source: jobData.location_source,
        status: 'draft' // Always create as draft first
      };

      const { data, error: insertError } = await supabase
        .from('job_postings')
        .insert([jobPayload])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Job Posting Created",
        description: "Your job posting has been saved as a draft. You can publish it when ready.",
      });

      return data as JobPosting;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create job posting';
      setError(errorMessage);
      toast({
        title: "Error Creating Job Posting",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateJobPosting = useCallback(async (id: string, jobData: Partial<JobPostingData>): Promise<JobPosting | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('job_postings')
        .update({
          ...jobData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Job Posting Updated",
        description: "Your changes have been saved successfully.",
      });

      return data as JobPosting;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update job posting';
      setError(errorMessage);
      toast({
        title: "Error Updating Job Posting",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const publishJobPosting = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('job_postings')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Job Posting Published",
        description: "Your job posting is now live and visible to candidates.",
      });

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to publish job posting';
      setError(errorMessage);
      toast({
        title: "Error Publishing Job Posting",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const archiveJobPosting = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('job_postings')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Job Posting Archived",
        description: "Your job posting has been archived and is no longer visible to candidates.",
      });

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to archive job posting';
      setError(errorMessage);
      toast({
        title: "Error Archiving Job Posting",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteJobPosting = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      toast({
        title: "Job Posting Deleted",
        description: "Your job posting has been permanently deleted.",
      });

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete job posting';
      setError(errorMessage);
      toast({
        title: "Error Deleting Job Posting",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getUserJobPostings = useCallback(async (): Promise<JobPosting[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to view your job postings');
      }

      const { data, error: fetchError } = await supabase
        .from('job_postings')
        .select('*')
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      return data as JobPosting[];
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch job postings';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getJobPostingById = useCallback(async (id: string): Promise<JobPosting | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return data as JobPosting;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch job posting';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const findJobsNearLocation = useCallback(async (
    latitude: number, 
    longitude: number, 
    radiusKm: number = 50, 
    limit: number = 20
  ): Promise<JobPosting[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .rpc('find_jobs_within_distance', {
          user_lat: latitude,
          user_lng: longitude,
          radius_km: radiusKm,
          job_limit: limit
        });

      if (fetchError) {
        throw fetchError;
      }

      return data as JobPosting[];
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to find jobs near location';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createJobPosting,
    updateJobPosting,
    publishJobPosting,
    archiveJobPosting,
    deleteJobPosting,
    getUserJobPostings,
    getJobPostingById,
    findJobsNearLocation
  };
};
