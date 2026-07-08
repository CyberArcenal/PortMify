// src/pages/stats/hooks/useStats.ts
import { useState, useEffect, useCallback } from "react";
import statsAPI, { Stats } from "@/api/core/stats";

interface UseStatsReturn {
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  updateStats: (data: Partial<Stats>) => Promise<void>;
}

const useStats = (): UseStatsReturn => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await statsAPI.get();
      setStats(data);
    } catch (err: any) {
      // If 404, it's okay (no stats yet)
      if (err.response?.status === 404) {
        setStats(null);
      } else {
        setError(err.message || "Failed to load stats");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const updateStats = async (data: Partial<Stats>) => {
    try {
      if (stats && stats.id) {
        // If stats exist, update (patch)
        await statsAPI.patch(data);
      } else {
        // Otherwise create
        const defaultData = {
          projects_completed: 0,
          client_satisfaction: 0,
          years_experience: 0,
          happy_clients: 0,
          ...data,
        };
        await statsAPI.create(defaultData);
      }
      // After update, refresh
      await fetchStats();
    } catch (err: any) {
      throw new Error(err.message || "Failed to update stats");
    }
  };

  const reload = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    reload,
    updateStats,
  };
};

export default useStats;