// src/navigation/ReelStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PostMenuScreen from '../screens/ChoosePostTypeScreen';
import ReelUploader from '../screens/ReelUploaderScreen';
import VideoPickerScreen from '../screens/VideoPickerScreen';

export type ReelStackParamList = {
  ChoosePostTypeScreen: undefined;
  VideoPickerScreen: undefined;
  VideoEditingScreen: { video: any };
  ReelUploadScreen: { video: any };
};

const Stack = createNativeStackNavigator<ReelStackParamList>();

export default function ReelStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChoosePostTypeScreen" component={PostMenuScreen} />
      <Stack.Screen name="VideoPickerScreen" component={VideoPickerScreen} />
      <Stack.Screen name="VideoEditingScreen" component={require('../screens/VideoEditingScreen').default} />
      <Stack.Screen name="ReelUploadScreen" component={ReelUploader} />
    </Stack.Navigator>
  );
}
