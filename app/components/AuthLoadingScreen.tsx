import React, {useEffect} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import type {DimensionValue} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {pastelColors} from '../theme/colors';

const AnimatedView = Animated.View as React.ComponentType<any>;

type SkeletonBarProps = {
  width: DimensionValue;
  height: number;
  delay?: number;
};

function SkeletonBar({width, height, delay = 0}: SkeletonBarProps) {
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1100 + delay,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false,
    );
  }, [delay, shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{translateX: shimmer.value * 220}],
  }));

  return (
    <View
      testID="auth-skeleton-bar"
      style={[
        styles.skeletonBar,
        {
          width,
          height,
        },
      ]}>
      <AnimatedView style={[styles.skeletonShimmer, shimmerStyle]} />
    </View>
  );
}

export default function AuthLoadingScreen() {
  return (
    <SafeAreaView testID="auth-loading-screen" style={styles.container}>
      <View testID="auth-header-skeleton" style={styles.header}>
        <SkeletonBar width={28} height={28} />
        <SkeletonBar width={118} height={22} delay={80} />
        <SkeletonBar width={28} height={28} delay={160} />
      </View>
      <ScrollView
        testID="auth-feed-skeleton"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feed}>
        <View style={styles.storyRow}>
          {Array.from({length: 6}).map((_, index) => (
            <View key={index} testID="auth-story-skeleton" style={styles.storyItem}>
              <View style={styles.storyRing}>
                <SkeletonBar width={50} height={50} delay={index * 70} />
              </View>
              <SkeletonBar width={46} height={8} delay={index * 80} />
            </View>
          ))}
        </View>

        {Array.from({length: 2}).map((_, index) => (
          <View key={index} testID="auth-post-skeleton" style={styles.post}>
            <View style={styles.postHeader}>
              <View style={styles.postAuthor}>
                <SkeletonBar width={86} height={10} delay={index * 90} />
                <SkeletonBar width={54} height={8} delay={index * 110} />
              </View>
              <SkeletonBar width={32} height={32} delay={index * 120} />
            </View>
            <View style={styles.postImage}>
              <SkeletonBar width="100%" height={356} delay={index * 150} />
            </View>
            <View style={styles.actionRow}>
              <SkeletonBar width={58} height={26} delay={index * 180} />
              <View style={styles.actionGroup}>
                <SkeletonBar width={52} height={26} delay={index * 210} />
                <SkeletonBar width={52} height={26} delay={index * 240} />
              </View>
            </View>
            <SkeletonBar width="42%" height={10} delay={index * 260} />
            <SkeletonBar width="26%" height={8} delay={index * 280} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pastelColors.white,
  },
  header: {
    minHeight: 58,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: pastelColors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E3E8',
  },
  feed: {
    paddingBottom: 28,
  },
  storyRow: {
    minHeight: 92,
    paddingHorizontal: 8,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1D1DD',
  },
  storyItem: {
    width: 58,
    alignItems: 'center',
    gap: 8,
  },
  storyRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: pastelColors.auth.shimmerBase,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  post: {
    paddingTop: 8,
  },
  postHeader: {
    minHeight: 42,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postAuthor: {
    gap: 7,
  },
  postImage: {
    width: '100%',
    height: 356,
    overflow: 'hidden',
    backgroundColor: pastelColors.auth.shimmerBase,
  },
  actionRow: {
    paddingHorizontal: 14,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  skeletonBar: {
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: pastelColors.auth.shimmerBase,
  },
  skeletonShimmer: {
    width: 86,
    height: '100%',
    opacity: 0.9,
    backgroundColor: pastelColors.auth.shimmerHighlight,
  },
});
