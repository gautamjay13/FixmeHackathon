import { useState, useCallback, useRef } from 'react';
import api from '../../api/api';
import { toast } from 'sonner';

interface UseOnlineStatusReturn {
  isOnline: boolean;
  toggling: boolean;
  toggleOnlineStatus: () => Promise<void>;
}

const DEBOUNCE_MS = 500;

export function useOnlineStatus(initial: boolean = true): UseOnlineStatusReturn {
  const [isOnline, setIsOnline] = useState(initial);
  const [toggling, setToggling] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleOnlineStatus = useCallback(async () => {
    // Debounce rapid clicks
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      const next = !isOnline;
      setToggling(true);

      try {
        await api.patch('/user/status', { isOnline: next });
        setIsOnline(next);
        toast.success(next ? "You're now online — new jobs will appear." : "You're offline. Pending jobs are hidden.");
      } catch (err: any) {
        toast.error(err.message || 'Could not update status. Please try again.');
      } finally {
        setToggling(false);
      }
    }, DEBOUNCE_MS);
  }, [isOnline]);

  return { isOnline, toggling, toggleOnlineStatus };
}
