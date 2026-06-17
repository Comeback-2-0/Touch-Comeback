import {useState} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import type {AxiosProgressEvent} from 'axios';
import {createPost} from '../api/postsApi';
import type {CreatePostPayload} from '../types';
import {HOME_FEED_QUERY_KEY} from './useHomeFeed';

export function useCreatePost() {
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreatePostPayload) =>
      createPost(payload, (event: AxiosProgressEvent) => {
        if (!event.total) return;
        setProgress(Math.round((event.loaded / event.total) * 100));
      }),
    retry: false,
    onMutate: () => setProgress(0),
    onSuccess: () => {
      setProgress(100);
      queryClient.invalidateQueries({queryKey: HOME_FEED_QUERY_KEY});
      queryClient.invalidateQueries({queryKey: ['posts', 'user']});
    },
  });

  return {...mutation, progress};
}
