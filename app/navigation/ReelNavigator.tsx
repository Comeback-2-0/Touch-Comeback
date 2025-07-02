import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ReelMenuScreen from '../screens/ReelMenuScreen';
import ReelPickerScreen from '../screens/ReelPickerScreen';
import ReelEditorScreen from '../screens/ReelEditorScreen';
import ReelTrimScreen from '../screens/ReelTrimScreen';
import ReelAudioScreen from '../screens/ReelAudioScreen';
import ReelTextScreen from '../screens/TextScreen';
import ReelFilterScreen from '../screens/ReelFilterScreen';
import ReelEditScreen from '../screens/ReelEditScreen';
import ReelMicScreen from '../screens/ReelMicScreen';
import ReelShareScreen from '../screens/ReelShareScreen';
import { ReelStackParamList } from '../navigation/types/ReelStackParamList';

const Stack = createNativeStackNavigator<ReelStackParamList>();



export default function ReelNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReelMenu" component={ReelMenuScreen} />
      <Stack.Screen name="ReelPicker" component={ReelPickerScreen} />
      <Stack.Screen name="ReelEditor" component={ReelEditorScreen} />
      <Stack.Screen name="ReelTrim" component={ReelTrimScreen} />
      <Stack.Screen name="ReelAudio" component={ReelAudioScreen} />
      <Stack.Screen name="ReelText" component={ReelTextScreen} />
      <Stack.Screen name="ReelFilter" component={ReelFilterScreen} />
      <Stack.Screen name="ReelEdit" component={ReelEditScreen} />
      <Stack.Screen name="ReelMic" component={ReelMicScreen} />
      <Stack.Screen name="ReelShare" component={ReelShareScreen} />
    </Stack.Navigator>
  );
}
