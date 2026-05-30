import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {pastelColors} from '../theme/colors';
import type {AppStackParamList} from '../navigation/AppStack';
import {useCurrentProfile} from '../features/profile/hooks/useCurrentProfile';
import ProfileStats from '../features/profile/components/ProfileStats';
import ProfileStatusPill from '../features/profile/components/ProfileStatusPill';
import ProfilePlaceholderTabs from '../features/profile/components/ProfilePlaceholderTabs';

type Navigation = NativeStackNavigationProp<AppStackParamList>;

function ProfileLoading() {
  return (
    <SafeAreaView style={styles.centered}>
      <ActivityIndicator color={pastelColors.accent} />
      <Text style={styles.centerText}>Loading profile...</Text>
    </SafeAreaView>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<Navigation>();
  const {data: profile, isLoading, isError, refetch} = useCurrentProfile();

  if (isLoading) return <ProfileLoading />;

  if (isError || !profile) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorTitle}>Could not load profile</Text>
        <Pressable testID="profile-retry-button" onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryLabel}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Profile</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            onPress={() => navigation.navigate('Settings')}
            style={styles.iconButton}>
            <Feather name="settings" size={22} color={pastelColors.auth.deepText} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          {profile.profilePicture ? (
            <Image source={{uri: profile.profilePicture}} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.emptyAvatar]}>
              <Ionicons name="person" size={42} color={pastelColors.accent} />
            </View>
          )}
          <View style={styles.identity}>
            <Text testID="profile-name" style={styles.displayName}>
              {profile.name || 'Touch User'}
            </Text>
            <Text testID="profile-username" style={styles.username}>
              @{profile.username || 'touch_user'}
            </Text>
            <ProfileStatusPill isPrivate={profile.isPrivate} />
          </View>
        </View>

        <Text testID="profile-bio" style={styles.bio}>
          {profile.bio || 'No bio yet.'}
        </Text>

        <ProfileStats
          posts={profile.postsCount}
          followers={profile.followersCount}
          following={profile.followingCount}
        />

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.editButton}>
          <Ionicons name="create-outline" size={18} color={pastelColors.white} />
          <Text style={styles.editLabel}>Edit Profile</Text>
        </Pressable>

        <ProfilePlaceholderTabs />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: pastelColors.auth.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  screenTitle: {
    color: pastelColors.auth.deepText,
    fontSize: 30,
    fontWeight: '900',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastelColors.white,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: pastelColors.card,
  },
  emptyAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: {
    flex: 1,
    marginLeft: 18,
    gap: 10,
  },
  username: {
    marginTop: 2,
    color: pastelColors.auth.deepText,
    fontSize: 15,
    fontWeight: '800',
    opacity: 0.78,
  },
  displayName: {
    color: pastelColors.auth.deepText,
    fontSize: 23,
    fontWeight: '900',
  },
  bio: {
    marginBottom: 20,
    color: pastelColors.auth.mutedText,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  editButton: {
    marginTop: 20,
    minHeight: 52,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastelColors.accent,
  },
  editLabel: {
    color: pastelColors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: pastelColors.auth.background,
  },
  centerText: {
    marginTop: 12,
    color: pastelColors.auth.mutedText,
    fontWeight: '700',
  },
  errorTitle: {
    color: pastelColors.auth.deepText,
    fontSize: 18,
    fontWeight: '900',
  },
  retryButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: pastelColors.accent,
  },
  retryLabel: {
    color: pastelColors.white,
    fontWeight: '900',
  },
});
