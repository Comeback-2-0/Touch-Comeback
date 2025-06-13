// app/screens/AuthScreen.tsx
import React from 'react';
import { View, Button, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

export default function AuthScreen() {
  const { signInWithGoogle, loading, user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigation.replace('Home');
    } catch (err) {
      console.error('Google Sign-In Error:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to Touch</Text>
      <Button title="Continue with Google" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 24, marginBottom: 20 },
});