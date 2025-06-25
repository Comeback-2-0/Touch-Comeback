import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SettingsStackParamList } from '../navigation/types/SettingsStackParamList'; // ✅ adjust if path differs

type NavigationProp = NativeStackNavigationProp<SettingsStackParamList, 'Settings'>;

type SettingItem = {
  key: string;
  label: string;
  icon: string;
  screen: keyof SettingsStackParamList;
};

type Section = {
  title: string;
  data: SettingItem[];
};

const settingsSections: Section[] = [
  {
    title: 'Account',
    data: [
      {
        key: 'ChangePassword',
        label: 'Change Password',
        icon: 'lock-closed-outline',
        screen: 'ChangePassword',
      },
    ],
  },
  {
    title: 'Preferences',
    data: [
      { key: 'Notifications', label: 'Notifications', icon: 'notifications-outline', screen: 'Notifications' },
      { key: 'Theme', label: 'Theme', icon: 'color-palette-outline', screen: 'Theme' },
    ],
  },
  {
    title: 'Privacy & Security',
    data: [
      { key: 'BlockedAccounts', label: 'Blocked Accounts', icon: 'eye-off-outline', screen: 'BlockedAccounts' },
      { key: 'Security', label: 'Security', icon: 'shield-checkmark-outline', screen: 'Security' },
    ],
  },
  
];

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();


  const renderItem = ({ item }: { item: SettingItem }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate(item.screen)}
    >
      <Ionicons name={item.icon} size={22} color="#333" />
      <Text style={styles.label}>{item.label}</Text>
      <Ionicons
        name="chevron-forward"
        size={18}
        color="#888"
        style={{ marginLeft: 'auto' }}
      />
    </TouchableOpacity>
  );

 

    return (
    <FlatList
      data={settingsSections.flatMap((section) => [
        { type: 'header', title: section.title },
        ...section.data.map((item) => ({ ...item, type: 'item' })),
      ])}
      renderItem={({ item }: any) =>
        item.type === 'header' ? (
          <Text style={styles.sectionTitle}>{item.title}</Text>
        ) : (
          renderItem({ item })
        )
      }
      keyExtractor={(item: any) => item.key ?? item.title}
      contentContainerStyle={styles.container}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 20,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  label: {
    fontSize: 15,
    marginLeft: 15,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f1f1',
  },
});
