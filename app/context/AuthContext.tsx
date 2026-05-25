import React, {createContext, useContext, useEffect, useState} from 'react';
import {
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from '@react-native-firebase/auth';
import axios from 'axios';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {API_URL, api, setAuthFailureHandler} from '../utils/api';
import {
  clearAuthTokens,
  getAuthTokens,
  saveAuthTokens,
} from '../utils/authTokenStorage';

export type BackendUser = {
  _id: string;
  uid?: string;
  name: string;
  email: string;
  photo?: string;
  role?: string;
};

interface AuthContextShape {
  user: BackendUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const auth = getAuth();
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthFailureHandler(() => {
      setUser(null);
    });

    const restoreSession = async () => {
      try {
        const tokens = await getAuthTokens();
        if (!tokens?.accessToken) return;

        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (err) {
        await clearAuthTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    return () => setAuthFailureHandler(null);
  }, []);

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      await GoogleSignin.signIn();
      const {idToken} = await GoogleSignin.getTokens();

      if (!idToken) throw new Error('No idToken returned from Google Sign-In');

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);

      const response = await axios.post(`${API_URL}/auth/google`, {idToken});

      await saveAuthTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  };

  const signOut = async () => {
    const tokens = await getAuthTokens();
    if (tokens?.refreshToken) {
      try {
        await axios.post(`${API_URL}/auth/logout`, {
          refreshToken: tokens.refreshToken,
        });
      } catch (err) {
        console.error('Backend logout failed:', err);
      }
    }

    await clearAuthTokens();
    await firebaseSignOut(auth);
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{user, loading, signInWithGoogle, signOut}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
