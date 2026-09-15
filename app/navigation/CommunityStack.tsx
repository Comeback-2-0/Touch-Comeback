// app/navigation/CommunityStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CommunityBrowseScreen from '../screens/community/CommunityBrowseScreen';
import CommunityHomeScreen from '../screens/community/CommunityHomeScreen';
import CommunityComposeScreen from '../screens/community/CommunityComposeScreen';
import CommunityQueueScreen from '../screens/community/CommunityQueueScreen';
import CommunityCreateScreen from '../screens/community/CommunityCreateScreen';
import CommunityPostScreen from '../screens/community/CommunityPostScreen';
import CommunityManageScreen from '../screens/community/CommunityManageScreen';

export type CommunitySummary = {
  id: string;
  _id: string;
  name: string;
  description: string;
  image: string;
  membersCount: number;
  contentVisibility?: 'public' | 'members';
  joinMode?: 'open' | 'approval' | 'invite-only';
};

export type CommunityStackParamList = {
  CommunityBrowse: undefined;
  CommunityHome: { community: CommunitySummary };
  CommunityCompose: { community: CommunitySummary };
  CommunityQueue: { community: CommunitySummary };
  CommunityCreate: undefined;
  CommunityPost: {community: CommunitySummary; contentId: string};
  CommunityManage: {community: CommunitySummary};
};

const Stack = createNativeStackNavigator<CommunityStackParamList>();

export default function CommunityStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="CommunityBrowse"
        component={CommunityBrowseScreen}
      />
      <Stack.Screen
        name="CommunityHome"
        component={CommunityHomeScreen}
      />
      <Stack.Screen name="CommunityCompose" component={CommunityComposeScreen} />
      <Stack.Screen name="CommunityQueue" component={CommunityQueueScreen} />
      <Stack.Screen name="CommunityCreate" component={CommunityCreateScreen} />
      <Stack.Screen name="CommunityPost" component={CommunityPostScreen} />
      <Stack.Screen name="CommunityManage" component={CommunityManageScreen} />
    </Stack.Navigator>
  );
}
