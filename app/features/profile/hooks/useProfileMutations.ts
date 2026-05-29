import {useState} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import type {AxiosProgressEvent} from 'axios';
import {
  completeProfile,
  updateProfile,
  uploadProfilePicture,
} from '../api/profileApi';
import type {LocalProfileImage, ProfilePayload} from '../types';
import {useAuthStore} from '../store/authStore';
import {PROFILE_QUERY_KEY} from './useCurrentProfile';

export function useCompleteProfile() {
  const queryClient = useQueryClient();
  const setProfile = useAuthStore(state => state.setProfile);

  return useMutation({
    mutationFn: (payload: ProfilePayload) => completeProfile(payload),
    retry: false,
    onSuccess: profile => {
      setProfile(profile);
      queryClient.setQueryData(PROFILE_QUERY_KEY, profile);
      queryClient.invalidateQueries({queryKey: PROFILE_QUERY_KEY});
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setProfile = useAuthStore(state => state.setProfile);

  return useMutation({
    mutationFn: (payload: ProfilePayload) => updateProfile(payload),
    retry: false,
    onMutate: async payload => {
      await queryClient.cancelQueries({queryKey: PROFILE_QUERY_KEY});
      const previous = queryClient.getQueryData(PROFILE_QUERY_KEY);
      queryClient.setQueryData(PROFILE_QUERY_KEY, (current: any) => ({
        ...current,
        ...payload,
      }));
      return {previous};
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(PROFILE_QUERY_KEY, context.previous);
      }
    },
    onSuccess: profile => {
      setProfile(profile);
      queryClient.setQueryData(PROFILE_QUERY_KEY, profile);
      queryClient.invalidateQueries({queryKey: PROFILE_QUERY_KEY});
    },
  });
}

export function useUploadProfilePicture() {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (image: LocalProfileImage) =>
      uploadProfilePicture(image, (event: AxiosProgressEvent) => {
        if (!event.total) return;
        setProgress(Math.round((event.loaded / event.total) * 100));
      }),
    retry: false,
    onMutate: () => setProgress(0),
    onSuccess: () => setProgress(100),
  });

  return {...mutation, progress};
}
