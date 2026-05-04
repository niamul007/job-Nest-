import { create } from 'zustand';
import type { Job } from '../types';

/**
 * Job state shape.
 * Handles job listing, selection, loading and error states.
 * No localStorage — job data is always fetched fresh from API.
 */
interface JobState {
  jobs: Job[];              // list of jobs currently displayed
  selectedJob: Job | null;  // job user clicked on — for detail view
  isLoading: boolean;       // true while API call is in progress
  error: string | null;     // error message if API call failed

  setJobs: (jobs: Job[]) => void;
  setSelectedJob: (job: Job | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Global job store.
 * Starts empty — populated by API calls in components/hooks.
 * isLoading and error enable consistent loading/error UI across components.
 *
 * Usage:
 *   const { jobs, isLoading, error, setJobs } = useJobStore()
 */
export const useJobStore = create<JobState>((set) => ({
  jobs: [],             // empty on startup — fetched from API
  selectedJob: null,    // no job selected initially
  isLoading: false,     // not loading initially
  error: null,          // no error initially

  // Simple setters — just update state, no side effects
  setJobs: (jobs) => set({ jobs }),
  setSelectedJob: (job) => set({ selectedJob: job }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));