import type {AxiosProgressEvent} from 'axios';
import {api} from '../../../utils/api';
import type {
  CreatePostPayload,
  PostHiddenResponse,
  PostEngagementStatus,
  PostReportResponse,
  PostsPage,
  PostsQueryParams,
  PublicPost,
  ReportPostPayload,
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

export async function likePost(postId: string): Promise<PostEngagementStatus> {
  const response = await api.post<PostEngagementStatus>(`/posts/${postId}/like`);
  return response.data;
}

export async function unlikePost(postId: string): Promise<PostEngagementStatus> {
  const response = await api.delete<PostEngagementStatus>(`/posts/${postId}/like`);
  return response.data;
}

export async function fetchPostEngagementStatus(postId: string): Promise<PostEngagementStatus> {
  const response = await api.get<PostEngagementStatus>(`/posts/${postId}/engagement-status`);
  return response.data;
}

export async function reportPost(
  postId: string,
  payload: ReportPostPayload,
): Promise<PostReportResponse> {
  const response = await api.post<PostReportResponse>(`/posts/${postId}/report`, payload);
  return response.data;
}

export async function withdrawPostReport(postId: string): Promise<PostReportResponse> {
  const response = await api.delete<PostReportResponse>(`/posts/${postId}/report`);
  return response.data;
}

export async function markPostNotInterested(postId: string): Promise<PostHiddenResponse> {
  const response = await api.post<PostHiddenResponse>(`/posts/${postId}/not-interested`);
  return response.data;
}

export async function undoPostNotInterested(postId: string): Promise<PostHiddenResponse> {
  const response = await api.delete<PostHiddenResponse>(`/posts/${postId}/not-interested`);
  return response.data;
}
