// app/navigation/AppStack.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

import { PostQueueProvider } from '../context/PostQueueContext';

import Feed from '../screens/Feed';
import Reels from '../screens/ReelScreen';
import SearchBar from '../screens/SearchBar';
import ProfileStack from './ProfileStack';
import ChatNavigator from './ChatNavigator';
import PostReelStack from './PostReelsStack';
import EditProfile from '../screens/EditProfile';
import SettingsStack from './SettingsStack';

export type AppStackParamList = {
  MainTabs: undefined;
  PostReels: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  SearchBar: undefined;
  ChatTab: undefined;
  Reels: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function getTabIcon(routeName: keyof MainTabParamList, color: string, size: number) {
  switch (routeName) {
    case 'Home':
      return <Feather name="home" size={size} color={color} />;
    case 'SearchBar':
      return <Feather name="search" size={size} color={color} />;
    case 'ProfileTab':
      return <Feather name="user" size={size} color={color} />;
    case 'ChatTab':
      return <Ionicons name="chatbubbles-outline" size={size} color={color} />;
    case 'Reels':
      return <Feather name="smartphone" size={size} color={color} />;
    default:
      return null;
  }
}

function getTabScreenOptions({
  route,
}: {
  route: RouteProp<MainTabParamList, keyof MainTabParamList>;
}) {
  return {
    headerShown: false,
    tabBarShowLabel: false,
    tabBarActiveTintColor: '#ff00ff',
    tabBarInactiveTintColor: '#080008',
    tabBarItemStyle: styles.tabBarItem,
    tabBarStyle: styles.tabBar,
    tabBarIcon: ({color, size}: {color: string; size: number}) =>
      getTabIcon(route.name, color, size),
  };
}

function ChatTabScreen() {
  return (
    <PostQueueProvider>
      <ChatNavigator />
    </PostQueueProvider>
  );
}

function BottomTabNavigator() {
  return (
    <Tab.Navigator screenOptions={getTabScreenOptions}>
      <Tab.Screen name="Home" component={Feed} />
      <Tab.Screen name="SearchBar" component={SearchBar} />
      <Tab.Screen name="ChatTab" component={ChatTabScreen} />
      <Tab.Screen name="Reels" component={Reels} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="PostReels" component={PostReelStack} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsStack}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFC0CB',
    borderTopWidth: 0,
    elevation: 10,
  },
  tabBarItem: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
