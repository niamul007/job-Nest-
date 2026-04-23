import { create } from 'zustand';
import type { Job } from '../types';

interface JobState {
  jobs: Job[];
  selectedJob: Job | null;
  isLoading: boolean;
  error: string | null;
  setJobs: (jobs: Job[]) => void;
  setSelectedJob: (job: Job | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useJobStore = create<JobState>((set) => ({
  jobs: [],
  selectedJob: null,
  isLoading: false,
  error: null,

  setJobs: (jobs) => set({ jobs }),
  setSelectedJob: (job) => set({ selectedJob: job }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));