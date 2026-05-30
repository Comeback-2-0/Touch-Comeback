// app/screens/coming-soon/SearchComingSoon.tsx
import React, {useEffect} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import {pastelColors} from '../../theme/colors';

const AnimatedView = Animated.View as React.ComponentType<any>;
const AnimatedText = Animated.Text as React.ComponentType<any>;
const {width: SCREEN_W} = Dimensions.get('window');

/* ── ripple ring ─────────────────────────────────────────────── */
function RippleRing({delay, maxScale}: {delay: number; maxScale: number}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {duration: 3000, easing: Easing.out(Easing.ease)}),
        -1,
        false,
      ),
    );
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [{scale: 1 + progress.value * (maxScale - 1)}],
    opacity: 1 - progress.value,
    borderWidth: 2 - progress.value * 1.5,
  }));

  return <AnimatedView style={[styles.ripple, style]} />;
}

/* ── scanning line ───────────────────────────────────────────── */
function ScanLine() {
  const sweep = useSharedValue(0);

  useEffect(() => {
    sweep.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 2000, easing: Easing.inOut(Easing.ease)}),
        withTiming(0, {duration: 2000, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      false,
    );
  }, [sweep]);

  const style = useAnimatedStyle(() => ({
    top: `${interpolate(sweep.value, [0, 1], [20, 80])}%`,
    opacity: 0.6 + sweep.value * 0.3,
  }));

  return <AnimatedView style={[styles.scanLine, style]} />;
}

/* ── floating tag chip ───────────────────────────────────────── */
function FloatingTag({
  label,
  top,
  left,
  delay,
}: {
  label: string;
  top: number;
  left: number;
  delay: number;
}) {
  const float = useSharedValue(0);
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withDelay(
      delay,
      withTiming(1, {duration: 800, easing: Easing.out(Easing.ease)}),
    );
    float.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, {duration: 2400 + delay * 0.3, easing: Easing.inOut(Easing.ease)}),
          withTiming(0, {duration: 2400 + delay * 0.3, easing: Easing.inOut(Easing.ease)}),
        ),
        -1,
        false,
      ),
    );
  }, [float, fadeIn, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: fadeIn.value * (0.5 + float.value * 0.5),
    transform: [{translateY: float.value * -10}],
  }));

  return (
    <AnimatedView style={[styles.floatingTag, {top, left}, style]}>
      <Text style={styles.floatingTagText}>{label}</Text>
    </AnimatedView>
  );
}

/* ── main screen ─────────────────────────────────────────────── */
export default function SearchComingSoon() {
  const entrance = useSharedValue(0);
  const magnifyRotate = useSharedValue(0);
  const titleSlide = useSharedValue(0);
  const subtitleSlide = useSharedValue(0);
  const badgeSlide = useSharedValue(0);

  useEffect(() => {
    entrance.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.ease),
    });
    magnifyRotate.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 3000, easing: Easing.inOut(Easing.ease)}),
        withTiming(0, {duration: 3000, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      false,
    );
    titleSlide.value = withDelay(
      250,
      withTiming(1, {duration: 600, easing: Easing.out(Easing.ease)}),
    );
    subtitleSlide.value = withDelay(
      450,
      withTiming(1, {duration: 600, easing: Easing.out(Easing.ease)}),
    );
    badgeSlide.value = withDelay(
      650,
      withTiming(1, {duration: 600, easing: Easing.out(Easing.ease)}),
    );
  }, [entrance, magnifyRotate, titleSlide, subtitleSlide, badgeSlide]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
  }));

  const magnifyStyle = useAnimatedStyle(() => ({
    transform: [
      {rotate: `${interpolate(magnifyRotate.value, [0, 1], [-12, 12])}deg`},
      {scale: interpolate(magnifyRotate.value, [0, 0.5, 1], [1, 1.08, 1])},
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleSlide.value,
    transform: [{translateY: interpolate(titleSlide.value, [0, 1], [24, 0])}],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleSlide.value,
    transform: [
      {translateY: interpolate(subtitleSlide.value, [0, 1], [20, 0])},
    ],
  }));

  const badgeAnimStyle = useAnimatedStyle(() => ({
    opacity: badgeSlide.value,
    transform: [
      {translateY: interpolate(badgeSlide.value, [0, 1], [16, 0])},
      {scale: interpolate(badgeSlide.value, [0, 1], [0.8, 1])},
    ],
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <AnimatedView style={[styles.container, containerStyle]}>
        {/* floating discovery tags */}
        <FloatingTag label="#moods" top={90} left={30} delay={300} />
        <FloatingTag label="#feelings" top={140} left={SCREEN_W - 130} delay={600} />
        <FloatingTag label="#explore" top={200} left={50} delay={900} />
        <FloatingTag label="#trending" top={110} left={SCREEN_W - 160} delay={1200} />

        {/* scan line effect */}
        <ScanLine />

        {/* magnifying glass with ripple rings */}
        <View style={styles.orbContainer}>
          <RippleRing delay={0} maxScale={2.8} />
          <RippleRing delay={750} maxScale={2.4} />
          <RippleRing delay={1500} maxScale={3.2} />

          <AnimatedView style={[styles.orb, magnifyStyle]}>
            <Feather name="search" size={34} color={pastelColors.white} />
          </AnimatedView>
        </View>

        {/* text content */}
        <View style={styles.textArea}>
          <AnimatedView style={titleStyle}>
            <Text style={styles.title}>Discover</Text>
            <Text style={styles.titleAccent}>Coming Soon</Text>
          </AnimatedView>

          <AnimatedView style={subtitleStyle}>
            <Text style={styles.subtitle}>
              A whole new way to explore moods, people, and vibes.
              Search is getting a powerful upgrade — hang tight.
            </Text>
          </AnimatedView>

          <AnimatedView style={[styles.badge, badgeAnimStyle]}>
            <Feather
              name="compass"
              size={14}
              color={pastelColors.accent}
              style={styles.badgeIcon}
            />
            <Text style={styles.badgeText}>Exploring New Horizons</Text>
          </AnimatedView>
        </View>
      </AnimatedView>
    </SafeAreaView>
  );
}

/* ── styles ──────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: pastelColors.auth.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    overflow: 'hidden',
  },
  /* scan line */
  scanLine: {
    position: 'absolute',
    left: 30,
    right: 30,
    height: 2,
    borderRadius: 1,
    backgroundColor: pastelColors.primary,
    opacity: 0.4,
  },
  /* floating tags */
  floatingTag: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: pastelColors.auth.glassSurface,
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
  },
  floatingTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: pastelColors.auth.mutedText,
  },
  /* orb */
  orbContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  orb: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: pastelColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: pastelColors.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 8},
    elevation: 12,
  },
  ripple: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderColor: pastelColors.primary,
  },
  /* text */
  textArea: {
    alignItems: 'center',
    maxWidth: SCREEN_W * 0.85,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: pastelColors.auth.deepText,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  titleAccent: {
    fontSize: 34,
    fontWeight: '900',
    color: pastelColors.accent,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: pastelColors.auth.mutedText,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: pastelColors.auth.glassSurface,
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
  },
  badgeIcon: {
    marginRight: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: pastelColors.accent,
  },
});
