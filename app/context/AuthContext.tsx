// app/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from '@react-native-firebase/auth';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

interface AuthContextShape {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = getAuth();
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const userInfo = await GoogleSignin.signIn();
    const { idToken } = await GoogleSignin.getTokens();

    if (!idToken) throw new Error('No idToken returned from Google Sign-In');

    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(auth, credential);

    // Send idToken to backend
    const response = await axios.post(`${API_URL}/auth/google`, { idToken });

    console.log('✅ Sent token to backend:', response.data);
    // You can now use: response.data.user to store user in context if needed

  } catch (error) {
    console.error('Google Sign-In Error:', error);
  }
};


  const signOut = async () => {
    await firebaseSignOut(auth);
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};