import React from 'react';
import {ActivityIndicator, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {pastelColors} from '../../../theme/colors';
import type {LocalProfileImage} from '../types';

type Props = {
  image: LocalProfileImage | null;
  fallbackUri?: string;
  onPick: () => void;
  uploading?: boolean;
  progress?: number;
};

export default function ProfileAvatarPicker({
  image,
  fallbackUri,
  onPick,
  uploading = false,
  progress = 0,
}: Props) {
  const uri = image?.uri || fallbackUri;

  return (
    <View style={styles.wrapper}>
      <Pressable
        testID="profile-avatar-picker"
        accessibilityRole="button"
        accessibilityLabel="Choose profile picture"
        onPress={onPick}
        style={styles.avatarButton}>
        {uri ? (
          <Image testID="profile-avatar-image" source={{uri}} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.emptyAvatar]}>
            <Ionicons name="camera-outline" size={34} color={pastelColors.accent} />
          </View>
        )}
        <View style={styles.badge}>
          <Ionicons name="camera" size={15} color={pastelColors.white} />
        </View>
      </Pressable>
      <Text style={styles.label}>Profile Picture</Text>
      {uploading ? (
        <View style={styles.progressRow}>
          <ActivityIndicator size="small" color={pastelColors.accent} />
          <Text style={styles.progressText}>Uploading {progress}%</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: pastelColors.card,
  },
  emptyAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
  },
  badge: {
    position: 'absolute',
    right: 4,
    bottom: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastelColors.accent,
    borderWidth: 3,
    borderColor: pastelColors.white,
  },
  label: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '800',
    color: pastelColors.auth.deepText,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  progressText: {
    color: pastelColors.auth.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
});
