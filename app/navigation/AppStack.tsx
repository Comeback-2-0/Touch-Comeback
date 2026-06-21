// app/navigation/AppStack.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

// PostQueueProvider import preserved — will be restored when Community is ready
// import { PostQueueProvider } from '../context/PostQueueContext';

import SearchComingSoon from '../screens/coming-soon/SearchComingSoon';
import CommunityComingSoon from '../screens/coming-soon/CommunityComingSoon';
import ReelsComingSoon from '../screens/coming-soon/ReelsComingSoon';
import HomeComingSoon from '../screens/coming-soon/HomeComingSoon';
import HomeScreen from '../screens/HomeScreen';
import ProfileStack from './ProfileStack';
import PostReelStack from './PostReelsStack';
import EditProfile from '../screens/EditProfile';
import SettingsStack from './SettingsStack';
import CreatePostScreen from '../screens/CreatePostScreen';
import NotificationsPlaceholderScreen from '../screens/NotificationsPlaceholderScreen';
import type {LocalPostImage} from '../features/posts/types';

export type AppStackParamList = {
  MainTabs: undefined;
  PostReels: undefined;
  EditProfile: undefined;
  Settings: undefined;
  CreatePost: {images: LocalPostImage[]};
  Notifications: undefined;
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

// ChatTabScreen wrapper preserved — will be restored when Community is ready
// function ChatTabScreen() {
//   return (
//     <PostQueueProvider>
//       <ChatNavigator />
//     </PostQueueProvider>
//   );
// }

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
    tabBarStyle: styles.tabBar,
    tabBarItemStyle: styles.tabBarItem,
    // The library's internal Pressable (tabVerticalUiKit) uses
    // justifyContent: 'flex-start' — it cannot be overridden via
    // tabBarItemStyle which targets the outer wrapper, not the Pressable.
    // tabBarButton is the documented way to replace that inner Pressable.
    tabBarButton: (props: any) => (
      <TouchableOpacity
        {...props}
        style={[props.style, styles.tabBarButton]}
      />
    ),
    tabBarIcon: ({color, size}: {color: string; size: number}) =>
      getTabIcon(route.name, color, size),
  };
}

function BottomTabNavigator() {
  return (
    <Tab.Navigator screenOptions={getTabScreenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="SearchBar" component={SearchComingSoon} />
      <Tab.Screen name="ChatTab" component={CommunityComingSoon} />
      <Tab.Screen name="Reels" component={ReelsComingSoon} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="Notifications" component={NotificationsPlaceholderScreen} />
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
    flex: 1,
  },
  // Replaces the internal Pressable whose justifyContent is hardcoded
  // to 'flex-start' in the library source (BottomTabItem.tsx tabVerticalUiKit).
  // This is the correct hook point per React Navigation docs (tabBarButton prop).
  tabBarButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
