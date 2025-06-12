import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Communities from '../../../screens/CommunitiesTab';
import ChatRoom from '../../../screens/ChatRooms';

export type CommunitiesStackParamList = {
  Communities: undefined;
  ChatRoom: { community: any }; 
};

const Stack = createNativeStackNavigator<CommunitiesStackParamList>();

export default function CommunitiesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Communities"
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
