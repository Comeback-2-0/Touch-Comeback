// app/navigation/AppStack.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Foundation from 'react-native-vector-icons/Foundation';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

import { PostQueueProvider } from '../context/PostQueueContext';

import Feed from '../screens/Feed';
import PostReels from '../screens/ReelScreen';
import SearchBar from '../screens/SearchBar';
import CommunityStack from './CommunityStack';
import ProfileStack from './ProfileStack';
import ChatNavigator from './ChatNavigator';

export type MainTabParamList = {
  Home: undefined;
  Communities: undefined;
  Reels: undefined;
  SearchBar: undefined;
  ProfileTab: undefined;
  ChatTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: RouteProp<MainTabParamList, keyof MainTabParamList> }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#ff00ff',
        tabBarInactiveTintColor: 'black',
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'Home':
              return <Ionicons name="home" size={size} color={color} />;
            case 'SearchBar':
              return <FontAwesome name="search" size={size} color={color} />;
            case 'ProfileTab':
              return <FontAwesome6 name="user-secret" size={size} color={color} />;
            case 'ChatTab':
              return <Ionicons name="chatbubbles" size={size} color={color} />;
            case 'Reels':
              return <Foundation name="play-video" size={size} color={color} />;
            case 'Communities':
              return <Ionicons name="people" size={size} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={Feed} />
      <Tab.Screen name="Communities" component={CommunityStack} />
      <Tab.Screen name="Reels" component={PostReels} />
      <Tab.Screen name="SearchBar" component={SearchBar} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
      <Tab.Screen
        name="ChatTab"
        children={() => (
          <PostQueueProvider>
            <ChatNavigator />
          </PostQueueProvider>
        )}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'pink',
    height: 50,
    borderTopWidth: 0,
    elevation: 10,
  },
});

export default function AppStack() {
  return (
      <BottomTabNavigator />
  );
}
