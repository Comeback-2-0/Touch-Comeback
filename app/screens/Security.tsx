import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../navigation/types/SettingsStackParamList';


export default function ChangePasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('SettingsHome')} />
      <Text style={styles.title}>Security Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  back: { color: 'purple', marginBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold' },
});
