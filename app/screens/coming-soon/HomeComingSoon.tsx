// app/screens/coming-soon/HomeComingSoon.tsx
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
const {width: SCREEN_W} = Dimensions.get('window');

/* ── floating orb particles ──────────────────────────────────── */
function OrbitParticle({
  delay,
  radius,
  size,
  color,
}: {
  delay: number;
  radius: number;
  size: number;
  color: string;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {duration: 4200, easing: Easing.linear}),
        -1,
        false,
      ),
    );
  }, [delay, progress]);

  const style = useAnimatedStyle(() => {
    const angle = progress.value * 2 * Math.PI;
    return {
      transform: [
        {translateX: Math.cos(angle) * radius},
        {translateY: Math.sin(angle) * radius},
        {scale: 0.7 + 0.3 * Math.sin(angle)},
      ],
      opacity: 0.5 + 0.5 * Math.abs(Math.sin(angle)),
    };
  });

  return (
    <AnimatedView
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

/* ── main screen ─────────────────────────────────────────────── */
export default function HomeComingSoon() {
  const entrance = useSharedValue(0);
  const pulse = useSharedValue(0);
  const breathe = useSharedValue(0);
  const titleSlide = useSharedValue(0);
  const subtitleSlide = useSharedValue(0);
  const badgeSlide = useSharedValue(0);

  useEffect(() => {
    // entrance fade
    entrance.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.ease),
    });
    // pulsing heart orb
    pulse.value = withRepeat(
      withTiming(1, {duration: 2200, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
    // gentle breathing for backdrop
    breathe.value = withRepeat(
      withTiming(1, {duration: 5000, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
    // staggered text entrance
    titleSlide.value = withDelay(
      200,
      withTiming(1, {duration: 600, easing: Easing.out(Easing.ease)}),
    );
    subtitleSlide.value = withDelay(
      400,
      withTiming(1, {duration: 600, easing: Easing.out(Easing.ease)}),
    );
    badgeSlide.value = withDelay(
      600,
      withTiming(1, {duration: 600, easing: Easing.out(Easing.ease)}),
    );
  }, [entrance, pulse, breathe, titleSlide, subtitleSlide, badgeSlide]);

  /* ── animated styles ───────────────────────────────── */
  const containerStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
  }));

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{scale: 1 + pulse.value * 0.12}],
    shadowOpacity: 0.2 + pulse.value * 0.15,
  }));

  const orbGlowStyle = useAnimatedStyle(() => ({
    transform: [{scale: 1.4 + pulse.value * 0.25}],
    opacity: 0.15 + pulse.value * 0.12,
  }));

  const blob1Style = useAnimatedStyle(() => ({
    transform: [
      {translateX: breathe.value * 20 - 10},
      {translateY: breathe.value * 14},
      {rotate: `${breathe.value * 18}deg`},
    ],
  }));

  const blob2Style = useAnimatedStyle(() => ({
    transform: [
      {translateX: breathe.value * -16},
      {translateY: breathe.value * -12 + 6},
      {rotate: `${-10 + breathe.value * 12}deg`},
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

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeSlide.value,
    transform: [
      {translateY: interpolate(badgeSlide.value, [0, 1], [16, 0])},
      {scale: interpolate(badgeSlide.value, [0, 1], [0.8, 1])},
    ],
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <AnimatedView style={[styles.container, containerStyle]}>
        {/* aurora backdrop blobs */}
        <AnimatedView style={[styles.blob1, blob1Style]} />
        <AnimatedView style={[styles.blob2, blob2Style]} />

        {/* center orb cluster */}
        <View style={styles.orbContainer}>
          <AnimatedView style={[styles.orbGlow, orbGlowStyle]} />
          <AnimatedView style={[styles.orb, orbStyle]}>
            <Feather name="home" size={36} color={pastelColors.white} />
          </AnimatedView>

          {/* orbiting particles */}
          <OrbitParticle
            delay={0}
            radius={72}
            size={10}
            color={pastelColors.primary}
          />
          <OrbitParticle
            delay={600}
            radius={88}
            size={7}
            color={pastelColors.accent}
          />
          <OrbitParticle
            delay={1200}
            radius={64}
            size={12}
            color={pastelColors.auth.primaryOverlay}
          />
          <OrbitParticle
            delay={1800}
            radius={96}
            size={6}
            color={pastelColors.card}
          />
          <OrbitParticle
            delay={2400}
            radius={56}
            size={8}
            color={pastelColors.auth.accentOverlay}
          />
        </View>

        {/* text content */}
        <View style={styles.textArea}>
          <AnimatedView style={titleStyle}>
            <Text style={styles.title}>Feed</Text>
            <Text style={styles.titleAccent}>Coming Soon</Text>
          </AnimatedView>

          <AnimatedView style={subtitleStyle}>
            <Text style={styles.subtitle}>
              Your personalized feed is being crafted with care. Stay tuned for
              stories, posts, and moments from people you love.
            </Text>
          </AnimatedView>

          <AnimatedView style={[styles.badge, badgeStyle]}>
            <Feather
              name="zap"
              size={14}
              color={pastelColors.accent}
              style={styles.badgeIcon}
            />
            <Text style={styles.badgeText}>In Development</Text>
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
  /* blobs */
  blob1: {
    position: 'absolute',
    top: 60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: pastelColors.auth.primaryOverlay,
    opacity: 0.5,
  },
  blob2: {
    position: 'absolute',
    bottom: 80,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: pastelColors.auth.accentOverlay,
    opacity: 0.4,
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
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: pastelColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: pastelColors.shadow,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 10},
    elevation: 12,
  },
  orbGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: pastelColors.primary,
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
