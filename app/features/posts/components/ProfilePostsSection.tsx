import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {pastelColors} from '../../../theme/colors';
import PublicPostCard from './PublicPostCard';
import {useUserPosts} from '../hooks/useUserPosts';
import type {PublicPost} from '../types';

type Props = {
  userId?: string;
};

export default function ProfilePostsSection({userId}: Props) {
  const postsQuery = useUserPosts(userId);
  const posts: PublicPost[] = postsQuery.data?.posts || [];

  return (
    <View style={styles.container}>
      <View testID="profile-posts-placeholder" style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Posts</Text>
        {postsQuery.isRefetching ? <ActivityIndicator size="small" color={pastelColors.accent} /> : null}
      </View>

      {postsQuery.isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={pastelColors.accent} />
          <Text style={styles.stateText}>Loading posts...</Text>
        </View>
      ) : postsQuery.isError ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Could not load posts</Text>
          <Pressable onPress={() => postsQuery.refetch()} style={styles.retryButton}>
            <Text style={styles.retryLabel}>Retry</Text>
          </Pressable>
        </View>
      ) : posts.length ? (
        posts.map(post => <PublicPostCard key={post.id} post={post} compact />)
      ) : (
        <View style={styles.stateBox}>
          <Ionicons name="grid-outline" size={22} color={pastelColors.accent} />
          <Text style={styles.stateTitle}>No posts yet</Text>
        </View>
      )}

      <View testID="profile-saved-placeholder" style={styles.savedPlaceholder}>
        <Ionicons name="bookmark-outline" size={22} color={pastelColors.accent} />
        <Text style={styles.savedTitle}>Saved Posts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  headerRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: pastelColors.auth.deepText,
    fontSize: 18,
    fontWeight: '900',
  },
  stateBox: {
    minHeight: 112,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastelColors.white,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: pastelColors.auth.glassBorder,
  },
  stateTitle: {
    marginTop: 9,
    color: pastelColors.auth.deepText,
    fontWeight: '900',
  },
  stateText: {
    marginTop: 8,
    color: pastelColors.auth.mutedText,
    fontWeight: '700',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: pastelColors.accent,
  },
  retryLabel: {
    color: pastelColors.white,
    fontWeight: '900',
  },
  savedPlaceholder: {
    minHeight: 112,
    marginTop: 8,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastelColors.white,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: pastelColors.auth.glassBorder,
  },
  savedTitle: {
    marginTop: 9,
    color: pastelColors.auth.deepText,
    fontWeight: '800',
  },
});
