import axios from 'axios';

export const API_URL = 'https://api.comeback.website';

export const api = axios.create({
  baseURL: API_URL,
});

// ------------------- GROUP APIs -------------------
export const fetchJoinedGroups = (userId: string) =>
  api.get(`/groups/joined/${userId}`);

export const fetchTrendingGroups = () =>
  api.get('/groups/trending');

export const searchGroups = (query: string) =>
  api.get(`/groups/search?query=${query}`);

export const joinGroup = (groupId: string, userId: string) =>
  api.post(`/groups/${groupId}/join`, { userId });

// ------------------- QUEUE APIs -------------------
export const fetchQueuePosts = (groupId: string, userId: string) =>
  api.get(`/queue/${groupId}?userId=${userId}`);

export const createQueuePost = (groupId: string, content: string) =>
  api.post(`/queue/${groupId}`, { content });

export const voteQueuePost = (postId: string) =>
  api.post(`/queue/${postId}/vote`);

export const reportQueuePost = (postId: string) =>
  api.post(`/queue/${postId}/report`);


// ------------------- POSTS APIs -------------------
export const fetchGroupPosts = (groupId: string) =>
  api.get(`/posts/${groupId}/posts`);

export const likePost = (postId: string) =>
  api.post(`/posts/${postId}/like`);

export const commentOnPost = (postId: string, text: string, userId: string) =>
  api.post(`/posts/${postId}/comment`, { text, userId });

export const replyToComment = (commentId: string, text: string, userId: string) =>
  api.post(`/posts/comments/${commentId}/reply`, { text, userId });

export const uploadPost = async (formData: FormData) =>
  api.post('/posts/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });