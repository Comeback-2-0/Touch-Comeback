// app/navigation/AppStack.tsx
import React from 'react';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Foundation from 'react-native-vector-icons/Foundation';

import Feed from '../screens/Feed';
import PostReels from '../screens/ReelScreen';
import SearchBar from '../screens/SearchBar';
import CommunitiesStack from './CommunityStack';
import ProfileStack from './ProfileStack';

export type MainTabParamList = {
  Home: undefined;
  Communities: undefined;
  Reels: undefined;
  SearchBar: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function AppStack() {
  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }: {
        route: RouteProp<MainTabParamList, keyof MainTabParamList>;
      }): BottomTabNavigationOptions => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#ff00ff',
        tabBarInactiveTintColor: 'black',
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'Home':
              return <Ionicons name="home" size={size} color={color} />;
            case 'Communities':
              return <FontAwesome name="group" size={size} color={color} />;
            case 'Reels':
              return <Foundation name="play-video" size={size} color={color} />;
            case 'SearchBar':
              return <FontAwesome name="search" size={size} color={color} />;
            case 'ProfileTab':
              return <FontAwesome6 name="user-secret" size={size} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={Feed} />
      <Tab.Screen name="Communities" component={CommunitiesStack} />
      <Tab.Screen name="Reels" component={PostReels} />
      <Tab.Screen name="SearchBar" component={SearchBar} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'pink',
    height: 45,
  },
});