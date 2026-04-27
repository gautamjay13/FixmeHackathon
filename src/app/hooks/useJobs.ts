import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api/api';
import { toast } from 'sonner';

export interface Job {
  _id: string;
  customerName: string;
  serviceType: string;
  address: string;
  scheduledTime: string;
  distanceKm: number;
  price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  acceptedAt?: string;
  completedAt?: string;
  createdAt: string;
}

interface JobsState {
  pending: Job[];
  active: Job[];
  completed: Job[];
}

interface UseJobsReturn {
  jobs: JobsState;
  loading: boolean;
  acceptJob: (id: string) => Promise<void>;
  rejectJob: (id: string) => Promise<void>;
  completeJob: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

function groupJobs(allJobs: Job[]): JobsState {
  return {
    pending: allJobs.filter((j) => j.status === 'pending'),
    active: allJobs.filter((j) => j.status === 'accepted'),
    completed: allJobs.filter((j) => j.status === 'completed'),
  };
}

export function useJobs(isOnline: boolean, onStatsChange?: () => void): UseJobsReturn {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs');
      setAllJobs(res.data.data.jobs as Job[]);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Polling every 30s when online; clear when offline or unmounted
  useEffect(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (isOnline) {
      pollingRef.current = setInterval(() => {
        fetchJobs();
      }, 30_000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOnline, fetchJobs]);

  // ── Accept (optimistic) ───────────────────────────────────────────────────
  const acceptJob = useCallback(async (id: string) => {
    const snapshot = [...allJobs];

    // Optimistic update
    setAllJobs((prev) =>
      prev.map((j) =>
        j._id === id ? { ...j, status: 'accepted', acceptedAt: new Date().toISOString() } : j
      )
    );

    try {
      await api.patch(`/jobs/${id}/accept`);
      toast.success('Job accepted! Head to the customer.');
      onStatsChange?.();
    } catch (err: any) {
      // Rollback
      setAllJobs(snapshot);
      toast.error(err.message || 'Could not accept job. Please try again.');
    }
  }, [allJobs, onStatsChange]);

  // ── Reject (optimistic) ───────────────────────────────────────────────────
  const rejectJob = useCallback(async (id: string) => {
    const snapshot = [...allJobs];

    // Optimistic update — remove from pending immediately
    setAllJobs((prev) =>
      prev.map((j) => (j._id === id ? { ...j, status: 'rejected' } : j))
    );

    try {
      await api.patch(`/jobs/${id}/reject`);
      toast.info('Job declined.');
      onStatsChange?.();
    } catch (err: any) {
      // Rollback
      setAllJobs(snapshot);
      toast.error(err.message || 'Could not reject job. Please try again.');
    }
  }, [allJobs, onStatsChange]);

  // ── Complete ──────────────────────────────────────────────────────────────
  const completeJob = useCallback(async (id: string) => {
    const snapshot = [...allJobs];

    setAllJobs((prev) =>
      prev.map((j) =>
        j._id === id ? { ...j, status: 'completed', completedAt: new Date().toISOString() } : j
      )
    );

    try {
      await api.patch(`/jobs/${id}/complete`);
      toast.success('Job marked as complete! Great work.');
      onStatsChange?.();
    } catch (err: any) {
      setAllJobs(snapshot);
      toast.error(err.message || 'Could not complete job. Please try again.');
    }
  }, [allJobs, onStatsChange]);

  // When going offline, hide pending jobs from the UI (don't touch DB)
  const visibleJobs = isOnline
    ? groupJobs(allJobs)
    : { ...groupJobs(allJobs), pending: [] };

  return {
    jobs: visibleJobs,
    loading,
    acceptJob,
    rejectJob,
    completeJob,
    refetch: fetchJobs,
  };
}
