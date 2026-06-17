import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {pastelColors} from '../theme/colors';

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export default function NotificationsPlaceholderScreen({navigation}: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={styles.iconButton}>
          <Feather name="x" size={22} color={pastelColors.auth.deepText} />
        </Pressable>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Notifications</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: pastelColors.auth.background,
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastelColors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: pastelColors.auth.deepText,
    fontSize: 22,
    fontWeight: '900',
  },
});
