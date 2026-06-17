import type {AxiosProgressEvent} from 'axios';
import {api} from '../../../utils/api';
import type {
  CreatePostPayload,
  PostsPage,
  PostsQueryParams,
  PublicPost,
} from '../types';

type PostResponse = {
  post: PublicPost;
};

export async function createPost(
  payload: CreatePostPayload,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
): Promise<PublicPost> {
  const formData = new FormData();
  formData.append('text', payload.text);

  (payload.images || []).forEach((image, index) => {
    formData.append('images', {
      uri: image.uri,
      name: image.fileName || `post-image-${index + 1}.jpg`,
      type: image.type || 'image/jpeg',
    } as any);
  });

  const response = await api.post<PostResponse>('/posts', formData, {
    headers: {'Content-Type': 'multipart/form-data'},
    onUploadProgress,
  });
  return response.data.post;
}

export async function fetchHomeFeed(params: PostsQueryParams = {}): Promise<PostsPage> {
  const response = await api.get<PostsPage>('/posts/feed', {
    params: {
      limit: params.limit,
      cursor: params.cursor,
    },
  });
  return response.data;
}

export async function fetchUserPosts(
  userId: string,
  params: PostsQueryParams = {},
): Promise<PostsPage> {
  const response = await api.get<PostsPage>(`/posts/user/${userId}`, {
    params: {
      limit: params.limit,
      cursor: params.cursor,
    },
  });
  return response.data;
}
