import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FeedScreen from '../screens/Feed';
import PostReelsScreen from '../screens/ReelScreen';

export type RootStackParamList = {
  Feed: undefined;
  PostReels: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Feed" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Feed" component={FeedScreen} />
        <Stack.Screen name="PostReels" component={PostReelsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}