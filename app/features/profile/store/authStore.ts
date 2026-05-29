import {create} from 'zustand';
import type {Profile} from '../types';

export type BackendUser = {
  _id: string;
  uid?: string;
  firebaseUid?: string;
  name: string;
  email: string;
  photo?: string;
  role?: string;
  username?: string;
  profilePicture?: string;
  isProfileComplete?: boolean;
};

type AuthStore = {
  user: BackendUser | null;
  profile: Profile | null;
  loading: boolean;
  setUser: (user: BackendUser | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  resetAuth: () => void;
};

export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  profile: null,
  loading: true,
  setUser: user => set({user}),
  setProfile: profile => set({profile}),
  setLoading: loading => set({loading}),
  resetAuth: () => set({user: null, profile: null, loading: false}),
}));
