import {useQuery} from '@tanstack/react-query';
import {fetchUserPosts} from '../api/postsApi';

export function userPostsQueryKey(userId: string) {
  return ['posts', 'user', userId] as const;
}

export function useUserPosts(userId?: string) {
  return useQuery({
    queryKey: userPostsQueryKey(userId || ''),
    queryFn: () => fetchUserPosts(userId || '', {limit: 24}),
    enabled: Boolean(userId),
    staleTime: 20_000,
  });
}
