//app/navigation/ProfileStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Profile from "../screens/ProfileTab";
//import Settingss from "../screens/Settings";
import SettingsStacks from "../navigation/SettingsStack";
import EditProfile from "../screens/EditProfile";



export type ProfileStackParamList = {
  ProfileTabScreen: undefined;
  EditProfile: undefined;
  Settings: undefined;
  
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
        name="Settings"
        component={SettingsStacks}
        options={{ headerTitle: "Settings" }}
      />
      
    </Stack.Navigator>
  );
}