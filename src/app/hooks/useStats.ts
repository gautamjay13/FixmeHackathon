import { useState, useCallback, useEffect } from 'react';
import api from '../../api/api';
import { toast } from 'sonner';

export interface Stats {
  completedJobs: number;
  totalEarnings: number;
  jobTarget: number;
  earningsTarget: number;
  pendingJobs: number;
  acceptedJobs: number;
}

const DEFAULT_STATS: Stats = {
  completedJobs: 0,
  totalEarnings: 0,
  jobTarget: 25,
  earningsTarget: 15000,
  pendingJobs: 0,
  acceptedJobs: 0,
};

interface UseStatsReturn {
  stats: Stats;
  loading: boolean;
  jobProgress: number;
  earningsProgress: number;
  refetch: () => Promise<void>;
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/stats');
      setStats(res.data.data as Stats);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const jobProgress = Math.min((stats.completedJobs / stats.jobTarget) * 100, 100);
  const earningsProgress = Math.min((stats.totalEarnings / stats.earningsTarget) * 100, 100);

  return { stats, loading, jobProgress, earningsProgress, refetch: fetchStats };
}
