//app/navigation/ProfileStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Profile from "../screens/ProfileTab";

export type ProfileStackParamList = {
  ProfileTabScreen: undefined;
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
    </Stack.Navigator>
  );
}
