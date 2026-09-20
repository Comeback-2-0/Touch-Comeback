import React, {useMemo} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {pastelColors} from '../theme/colors';
import type {AppStackParamList} from '../navigation/AppStack';
import PublicPostCard from '../features/posts/components/PublicPostCard';
import {useHomeFeed} from '../features/posts/hooks/useHomeFeed';
import {pickPostImages} from '../features/posts/utils/postImagePicker';
import {isMediaPickerCancelled} from '../utils/mediaCrop';
import TouchLogo from '../../assets/logos/touch-logo.svg';

type Navigation = NativeStackNavigationProp<AppStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  const feedQuery = useHomeFeed();
  const posts = useMemo(() => feedQuery.data?.posts || [], [feedQuery.data?.posts]);

  const openCreatePost = async () => {
    try {
      const images = await pickPostImages();
      if (!images.length) return;
      navigation.navigate('CreatePost', {images});
    } catch (error) {
      if (!isMediaPickerCancelled(error)) {
        // Picker failures are non-fatal; user can tap again.
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View testID="home-logo" style={styles.logoShell}>
          <TouchLogo
            width={82}
            height={24}
            viewBox="185 225 1403 407"
            preserveAspectRatio="xMinYMid meet"
          />
        </View>
        <View style={styles.headerActions}>
          <Pressable
            testID="home-create-post"
            accessibilityRole="button"
            accessibilityLabel="Create post"
            onPress={openCreatePost}
            hitSlop={10}
            style={styles.iconButton}>
            <Feather name="plus-square" size={24} color={pastelColors.auth.deepText} />
          </Pressable>
          <Pressable
            testID="home-notifications"
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
            onPress={() => navigation.navigate('Notifications')}
            hitSlop={10}
            style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={pastelColors.auth.deepText} />
          </Pressable>
        </View>
      </View>

      {feedQuery.isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={pastelColors.accent} />
          <Text style={styles.centerText}>Loading posts...</Text>
        </View>
      ) : feedQuery.isError ? (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Could not load posts</Text>
          <Pressable onPress={() => feedQuery.refetch()} style={styles.retryButton}>
            <Text style={styles.retryLabel}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({item}) => <PublicPostCard post={item} />}
          refreshing={feedQuery.isRefetching}
          onRefresh={feedQuery.refetch}
          contentContainerStyle={posts.length ? styles.listContent : styles.emptyContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="edit-3" size={28} color={pastelColors.accent} />
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyCopy}>Create the first public post on Touch.</Text>
            </View>
          }
          removeClippedSubviews={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: pastelColors.auth.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoShell: {
    width: 82,
    height: 24,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconButton: {
    width: 24,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 18,
  },
  emptyContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 12,
    color: pastelColors.auth.deepText,
    fontSize: 18,
    fontWeight: '900',
  },
  emptyCopy: {
    marginTop: 6,
    color: pastelColors.auth.mutedText,
    textAlign: 'center',
    fontWeight: '700',
  },
});
