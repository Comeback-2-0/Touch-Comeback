import {useQuery} from '@tanstack/react-query';
import {fetchCurrentProfile} from '../api/profileApi';
import {useAuthStore} from '../store/authStore';

export const PROFILE_QUERY_KEY = ['profile', 'me'] as const;

type Options = {
  enabled?: boolean;
};

export function useCurrentProfile(options: Options = {}) {
  const setProfile = useAuthStore(state => state.setProfile);

  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchCurrentProfile,
    enabled: options.enabled ?? true,
    retry: 2,
    staleTime: 30_000,
    select: profile => {
      setProfile(profile);
      return profile;
    },
  });
}
