import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatNavigator from './ChatNavigator';

const Stack = createNativeStackNavigator();

export default function CommunityStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatNavigator" component={ChatNavigator} />
    </Stack.Navigator>
  );
}
