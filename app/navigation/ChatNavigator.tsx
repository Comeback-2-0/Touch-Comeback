// app/navigation/ChatNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GroupChatScreen from '../screens/GroupChatScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import GroupListScreen from '../screens/GroupListScreen';
import QueueScreen from '../screens/QueueScreen';

export type ChatStackParamList = {
  GroupListScreen: undefined;
  GroupChatScreen: {
    group: { id: string; name: string; members: number };
    userId: string;
  };
  CreatePostScreen: {
    group: { id: string; name: string; members: number };
    userId: string;
  };
  QueueScreen: {
    group: { id: string; name: string; members: number };
    userId: string;
  };
};


const Stack = createNativeStackNavigator<ChatStackParamList>();

export default function ChatNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupListScreen" component={GroupListScreen} />
      <Stack.Screen name="GroupChatScreen" component={GroupChatScreen} />
      <Stack.Screen name="CreatePostScreen" component={CreatePostScreen} />
      <Stack.Screen name="QueueScreen" component={QueueScreen} />
    </Stack.Navigator>
  );
}
