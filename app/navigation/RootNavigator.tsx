import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import AuthLoadingScreen from '../components/AuthLoadingScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import {useCurrentProfile} from '../features/profile/hooks/useCurrentProfile';

export type RootStackParamList = {
  Auth: undefined;
  ProfileSetup: undefined;
  Main: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const profileQuery = useCurrentProfile({enabled: Boolean(user)});

  if (loading) return <AuthLoadingScreen />;
  if (user && profileQuery.isLoading) return <AuthLoadingScreen />;

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <RootStack.Screen name="Auth" component={AuthStack} />
      ) : profileQuery.data?.isProfileComplete === false ? (
        <RootStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      ) : (
        <RootStack.Screen name="Main" component={AppStack} />
      )}
    </RootStack.Navigator>
  );
}
