import {useQuery} from '@tanstack/react-query';
import {fetchHomeFeed} from '../api/postsApi';

export const HOME_FEED_QUERY_KEY = ['posts', 'feed'] as const;

export function useHomeFeed() {
  return useQuery({
    queryKey: HOME_FEED_QUERY_KEY,
    queryFn: () => fetchHomeFeed({limit: 20}),
    staleTime: 20_000,
  });
}
