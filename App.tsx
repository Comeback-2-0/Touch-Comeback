// App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AuthProvider } from './app/context/AuthContext';
import RootNavigator from './app/navigation/RootNavigator';

export default function App() {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '160562514921-n7apc9k12tliqgni4ri10k5901qpvpmr.apps.googleusercontent.com',
    });
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
