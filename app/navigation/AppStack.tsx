import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Foundation from 'react-native-vector-icons/Foundation';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { PostQueueProvider } from '../context/PostQueueContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Feed from '../screens/Feed';
import PostReels from '../screens/ReelScreen';
import SearchBar from '../screens/SearchBar';
import CommunityStack from './CommunityStack';
import ProfileStack from './ProfileStack';
import ReelNavigator from './ReelStackNavigator';
const Tab = createBottomTabNavigator();


function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#ff69b4',
        tabBarInactiveTintColor: 'gray',
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
      <Tab.Screen name="Communities"
        children={() => (
          <PostQueueProvider>
            <CommunityStack />
          </PostQueueProvider>
        )}
      />
      <Tab.Screen name="Reels" component={PostReels} />
      <Tab.Screen name="SearchBar" component={SearchBar} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="ReelNavigator" component={ReelNavigator} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffe4e1',
    height: 50,
    borderTopWidth: 0,
    elevation: 10,
  },
});

