import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RouteProp, useRoute} from '@react-navigation/native';
import AuthScreen from '../screens/AuthScreen';
import type {RootStackParamList} from './RootNavigator';

export type AuthStackParamList = {
  AuthScreen: {authError?: string} | undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  const route = useRoute<RouteProp<RootStackParamList, 'Auth'>>();
  const authError = route.params?.authError;

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="AuthScreen"
        component={AuthScreen}
        initialParams={authError ? {authError} : undefined}
      />
    </Stack.Navigator>
  );
}
