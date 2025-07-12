import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FeedScreen from '../screens/Feed';
import PostReelsScreen from '../screens/PostReelScreen';

export type RootStackParamList = {
  //Feed: undefined;
  PostReels: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function PostReelsStack() {
  return (
    
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PostReels" component={PostReelsScreen} />
      </Stack.Navigator>
    
  );
}