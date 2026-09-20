import {useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';
import {fetchCurrentProfile} from '../api/profileApi';
import {useAuthStore} from '../store/authStore';

export const PROFILE_QUERY_KEY = ['profile', 'me'] as const;

type Options = {
  enabled?: boolean;
};

export function useCurrentProfile(options: Options = {}) {
  const setProfile = useAuthStore(state => state.setProfile);

  const query = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchCurrentProfile,
    enabled: options.enabled ?? true,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      // Don't hammer a dead server during bootstrap.
      if (!error?.response || (typeof status === 'number' && status >= 500)) {
        return false;
      }
      return failureCount < 1;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    if (query.data) {
      setProfile(query.data);
    }
  }, [query.data, setProfile]);

  return query;
}
