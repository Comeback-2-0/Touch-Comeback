//app/navigation/ProfileStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Profile from "../screens/ProfileTab";
import Settingss from "../screens/Settings";
import EditProfile from "../screens/EditProfile";
import ChangePasswordScreen from "../screens/ChangePassword";
import NotificationsScreen from "../screens/Notification";
import ThemeScreen from "../screens/Theme";
import BlockedAccountsScreen from "../screens/BlockedAccount";
import SecurityScreen from "../screens/Security";
import AboutTouchScreen from "../screens/AboutTouch";
import CommunityGuidelinesScreen from "../screens/Guildelines";
import ReportProblemScreen from "../screens/Report";


export type ProfileStackParamList = {
  ProfileTabScreen: undefined;
  EditProfile: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  Notifications :undefined;
  Theme :undefined;
  BlockedAccounts:undefined;
  Security:undefined;
  Touch:undefined;
  Guildlines:undefined;
  Report:undefined;
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
        component={Settingss}
        options={{ headerTitle: "Settings" }}
      />
       <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ headerTitle: "Change Your  Password" }}
      />
       <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerTitle: "Notifications" }}
      />
       <Stack.Screen
        name="Theme"
        component={ThemeScreen}
        options={{ headerTitle: "Them" }}
      />
       <Stack.Screen
        name="BlockedAccounts"
        component={BlockedAccountsScreen}
        options={{ headerTitle: "Blocked User" }}
      />
       <Stack.Screen
        name="Security"
        component={SecurityScreen}
        options={{ headerTitle: "Security Screen" }}
      />
       <Stack.Screen
        name="Touch"
        component={AboutTouchScreen}
        options={{ headerTitle: "change Password" }}
      />
      <Stack.Screen
        name="Report"
        component={ReportProblemScreen}
        options={{ headerTitle: "Report Your problem here" }}
      />
      <Stack.Screen
        name="Guildlines"
        component={CommunityGuidelinesScreen}
        options={{ headerTitle: "Community Guidelines " }}
      />

    </Stack.Navigator>
  );
}
