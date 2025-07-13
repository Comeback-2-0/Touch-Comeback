import axios from 'axios';
import { Comment } from '../navigation/types/Post';

export const API_URL = 'https://api.comeback.website';

export const api = axios.create({
  baseURL: API_URL,
});

// 🔄 USER SYNC FOR GOOGLE LOGIN
export const syncUser = async (userData: {
  googleId: string;
  name: string;
  email: string;
  photo: string;
}) => {
  try {
    const res = await api.post('/auth/google', userData);
    return res.data;
  } catch (err) {
    console.error('❌ User sync failed:', err);
    return null;
  }
};

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

export const likePost = (postId: string, userId: string) =>
  api.post(`/posts/${postId}/like`, { userId });

export const dislikePost = (postId: string, userId: string) =>
  api.post(`/posts/${postId}/dislike`, { userId });

export const commentOnPost = (postId: string, text: string, userId: string) =>
  api.post(`/posts/${postId}/comment`, { text, userId });

// ------------------- REPLIES API -------------------
export const fetchReplies = (commentId: string) =>
  api.get<Comment[]>(`/comments/${commentId}/replies`);

// ----------- COMMENT ACTION APIs -----------
export const likeComment = (commentId: string, userId: string) =>
  api.post(`/comments/${commentId}/like`, { userId });

export const dislikeComment = (commentId: string, userId: string) =>
  api.post(`/comments/${commentId}/dislike`, { userId });

export const reportComment = (commentId: string, userId: string) =>
  api.post(`/comments/${commentId}/report`, { userId });

export const replyToComment = (commentId: string, text: string, userId: string) =>
  api.post(`/comments/${commentId}/replies`, { text, userId });

export const uploadPost = async (formData: FormData) =>
  api.post('/posts/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const uploadReel = (formData: FormData) =>
  api.post('/api/reels/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const fetchReelMoods = (userId: string) =>
  api.get(`/api/reels/moods?userId=${userId}`);

export const fetchReelsFeed = (mood: string, page: number, userId: string) =>
  api.get(`/api/reels/feed?mood=${mood}&page=${page}&userId=${userId}`);

// ------------------- REELS APIs -------------------
export const fetchReelComments = (reelId: string) =>
  api.get(`/api/reels/${reelId}/comments`);

export const addReelComment = (reelId: string, userId: string, text: string) =>
  api.post(`/api/reels/${reelId}/comments`, { reelId, userId, text });

export const likeReel = (reelId: string, userId: string) =>
  api.post(`/api/reels/like`, { reelId, userId });

export const saveReel = (reelId: string, userId: string) =>
  api.post(`/api/reels/save`, { reelId, userId });

export const reportReel = (reelId: string, userId: string) =>
  api.post(`/api/reels/report`, { reelId, userId });

export const sendWatchTime = (reelId: string, userId: string, mood: string, duration: number) =>
  api.post(`/api/reels/watch`, { reelId, userId, mood, duration });
