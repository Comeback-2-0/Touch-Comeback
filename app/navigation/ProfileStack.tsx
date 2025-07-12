//app/navigation/ProfileStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Profile from "../screens/ProfileTab";
//import Settingss from "../screens/Settings";
import SettingsStacks from "../navigation/SettingsStack";
import EditProfile from "../screens/EditProfile";
//import SavedReels from "../screens/SavedReels";
import SavedReels from "../screens/SavedReels";



export type ProfileStackParamList = {
  ProfileTabScreen: undefined;
  EditProfile: undefined;
  Settings: undefined;
  SavedReels:{userId: string}
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileTabScreen"
        component={Profile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SavedReels"
        component={SavedReels}
        initialParams={{ userId: '6GXNC0QUvENCWUSYCMLgMyjWwcc2' }}
        options={{headerShown:false}}
       /> 
      <Stack.Screen
        name="Settings"
        component={SettingsStacks}
        options={{ headerTitle: "Settings" }}
      />
      
    </Stack.Navigator>
  );
}
