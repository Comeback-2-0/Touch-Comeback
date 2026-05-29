import type {AxiosProgressEvent} from 'axios';
import {api} from '../../../utils/api';
import type {LocalProfileImage, Profile, ProfileImageUpload, ProfilePayload} from '../types';

type ProfileResponse = {
  user: Profile;
};

type UsernameResponse = {
  available: boolean;
};

export async function fetchCurrentProfile(): Promise<Profile> {
  const response = await api.get<ProfileResponse>('/users/me');
  return response.data.user;
}

export async function completeProfile(payload: ProfilePayload): Promise<Profile> {
  const response = await api.post<ProfileResponse>('/users/complete-profile', payload);
  return response.data.user;
}

export async function updateProfile(payload: ProfilePayload): Promise<Profile> {
  const response = await api.patch<ProfileResponse>('/users/me', payload);
  return response.data.user;
}

export async function checkUsername(username: string): Promise<boolean> {
  const normalized = username.trim().toLowerCase();
  const response = await api.get<UsernameResponse>(
    `/users/check-username/${encodeURIComponent(normalized)}`,
  );
  return response.data.available;
}

export async function uploadProfilePicture(
  image: LocalProfileImage,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
): Promise<ProfileImageUpload> {
  const formData = new FormData();
  formData.append('profilePicture', {
    uri: image.uri,
    name: image.fileName || 'profile-picture.jpg',
    type: image.type || 'image/jpeg',
  } as any);

  const response = await api.post<ProfileImageUpload>(
    '/uploads/profile-picture',
    formData,
    {
      headers: {'Content-Type': 'multipart/form-data'},
      onUploadProgress,
    },
  );
  return response.data;
}
