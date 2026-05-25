import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {DimensionValue} from 'react-native';
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
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withTiming(1, {duration: 1800, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
  }, [float]);

  const cardMotion = useAnimatedStyle(() => ({
    transform: [{translateY: float.value * -8}],
  }));

  return (
    <View testID="auth-loading-screen" style={styles.container}>
      <AnimatedView style={[styles.motionPanelTop, cardMotion]} />
      <View style={styles.brandMark}>
        <Text style={styles.brandLetter}>T</Text>
      </View>
      <AnimatedView style={[styles.card, cardMotion]}>
        <SkeletonBar width="46%" height={18} />
        <SkeletonBar width="82%" height={12} delay={120} />
        <SkeletonBar width="68%" height={12} delay={240} />
        <View style={styles.skeletonGroup}>
          <SkeletonBar width="100%" height={48} delay={320} />
          <SkeletonBar width="74%" height={12} delay={420} />
        </View>
      </AnimatedView>
      <Text testID="auth-loading-status" style={styles.status}>
        Getting Touch ready...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    backgroundColor: pastelColors.auth.background,
    overflow: 'hidden',
  },
  motionPanelTop: {
    position: 'absolute',
    top: 86,
    width: 260,
    height: 150,
    borderRadius: 28,
    backgroundColor: pastelColors.auth.accentOverlay,
    transform: [{rotate: '-14deg'}],
  },
  brandMark: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    backgroundColor: pastelColors.primary,
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
    shadowColor: pastelColors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 14},
    elevation: 8,
  },
  brandLetter: {
    color: pastelColors.white,
    fontSize: 34,
    fontWeight: '800',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    borderRadius: 28,
    backgroundColor: pastelColors.auth.glassSurface,
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
  },
  skeletonGroup: {
    marginTop: 22,
    gap: 14,
  },
  skeletonBar: {
    overflow: 'hidden',
    borderRadius: 999,
    marginBottom: 14,
    backgroundColor: pastelColors.auth.shimmerBase,
  },
  skeletonShimmer: {
    width: 86,
    height: '100%',
    opacity: 0.9,
    backgroundColor: pastelColors.auth.shimmerHighlight,
  },
  status: {
    marginTop: 24,
    fontSize: 14,
    fontWeight: '600',
    color: pastelColors.auth.mutedText,
  },
});
