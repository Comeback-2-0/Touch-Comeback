// app/navigation/CommunityStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Communities from '../screens/CommunitiesTab';
import ChatRoom from '../screens/ChatRooms';
import type { Community } from '../navigation/types/community';

export type CommunitiesStackParamList = {
  CommunitiesTabScreen: undefined;
  ChatRoom: { community: Community };
};

const Stack = createNativeStackNavigator<CommunitiesStackParamList>();

export default function CommunitiesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CommunitiesTabScreen"
        component={Communities}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoom}
        options={{ headerTitle: 'Chat Room' }}
      />
    </Stack.Navigator>
  );
}
