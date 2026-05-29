import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {pastelColors} from '../../../theme/colors';

export default function ProfilePlaceholderTabs() {
  return (
    <View style={styles.container}>
      <View testID="profile-posts-placeholder" style={styles.placeholder}>
        <Ionicons name="grid-outline" size={22} color={pastelColors.accent} />
        <Text style={styles.title}>Posts Grid</Text>
      </View>
      <View testID="profile-saved-placeholder" style={styles.placeholder}>
        <Ionicons name="bookmark-outline" size={22} color={pastelColors.accent} />
        <Text style={styles.title}>Saved Posts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 12,
  },
  placeholder: {
    flex: 1,
    minHeight: 112,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastelColors.white,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: pastelColors.auth.glassBorder,
  },
  title: {
    marginTop: 9,
    color: pastelColors.auth.deepText,
    fontWeight: '800',
  },
});
