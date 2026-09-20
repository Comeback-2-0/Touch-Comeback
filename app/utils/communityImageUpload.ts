import {api} from '../utils/api';

type LocalCommunityImage = {
  uri: string;
  fileName?: string;
  type?: string;
};

function isRemoteImageUrl(uri?: string) {
  return Boolean(uri && /^https?:\/\//i.test(uri));
}

/** Upload a local community avatar; leave remote URLs untouched. */
export async function resolveCommunityImageUrl(uri?: string): Promise<string> {
  const value = String(uri || '').trim();
  if (!value) return '';
  if (isRemoteImageUrl(value)) return value;

  const form = new FormData();
  form.append('communityImage', {
    uri: value,
    name: value.split('/').pop() || 'community-image.jpg',
    type: 'image/jpeg',
  } as any);

  const response = await api.post<{url: string}>('/uploads/community-image', form, {
    headers: {'Content-Type': 'multipart/form-data'},
  });
  return response.data.url;
}

export async function uploadCommunityImageFile(
  image: LocalCommunityImage,
): Promise<string> {
  return resolveCommunityImageUrl(image.uri);
}
