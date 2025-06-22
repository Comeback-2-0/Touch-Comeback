// app/utils/api.ts
import axios from 'axios';

export const API_URL = 'https://api.comeback.website';

export const api = axios.create({
  baseURL: API_URL,
});

// Group-related API calls
export const fetchJoinedGroups = (userId: string) =>
  api.get(`/groups/joined/${userId}`);

export const fetchTrendingGroups = () =>
  api.get('/groups/trending');

export const searchGroups = (query: string) =>
  api.get(`/groups/search?query=${query}`);

export const joinGroup = (groupId: string, userId: string) =>
  api.post(`/groups/${groupId}/join`, { userId });