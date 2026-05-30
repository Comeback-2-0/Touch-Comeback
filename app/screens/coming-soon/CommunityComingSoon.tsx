// app/screens/coming-soon/CommunityComingSoon.tsx
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {pastelColors} from '../../theme/colors';

const AnimatedView = Animated.View as React.ComponentType<any>;
const {width: SCREEN_W} = Dimensions.get('window');

/* ── avatar bubble ───────────────────────────────────────────── */
function AvatarBubble({
  size,
  color,
  x,
  y,
  delay,
  icon,
}: {
  size: number;
  color: string;
  x: number;
  y: number;
  delay: number;
  icon: string;
}) {
  const float = useSharedValue(0);
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withDelay(
      delay,
      withTiming(1, {duration: 600, easing: Easing.out(Easing.ease)}),
    );
    float.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: 2600 + delay * 0.2,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: 2600 + delay * 0.2,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      ),
    );
  }, [float, fadeIn, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: fadeIn.value * (0.6 + float.value * 0.4),
    transform: [
      {translateY: interpolate(float.value, [0, 1], [0, -14])},
      {scale: interpolate(float.value, [0, 0.5, 1], [1, 1.1, 1])},
    ],
  }));

  return (
    <AnimatedView
      style={[
        styles.avatarBubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: x,
          top: y,
        },
        style,
      ]}>
      <Feather name={icon} size={size * 0.4} color={pastelColors.white} />
    </AnimatedView>
  );
}

/* ── connection line ─────────────────────────────────────────── */
function ConnectionLine({
  delay,
  angle,
  length,
}: {
  delay: number;
  angle: number;
  length: number;
}) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, {duration: 1800, easing: Easing.inOut(Easing.ease)}),
          withTiming(0.2, {duration: 1800, easing: Easing.inOut(Easing.ease)}),
        ),
        -1,
        false,
      ),
    );
  }, [pulse, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: pulse.value * 0.3,
    transform: [{scaleX: 0.5 + pulse.value * 0.5}],
  }));

  return (
    <AnimatedView
      style={[
        styles.connectionLine,
        {
          width: length,
          transform: [{rotate: `${angle}deg`}],
        },
        style,
      ]}
    />
  );
}

/* ── main screen ─────────────────────────────────────────────── */
export default function CommunityComingSoon() {
  const entrance = useSharedValue(0);
  const centerPulse = useSharedValue(0);
  const titleSlide = useSharedValue(0);
  const subtitleSlide = useSharedValue(0);
  const badgeSlide = useSharedValue(0);
  const waveDrift = useSharedValue(0);

  useEffect(() => {
    entrance.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.ease),
    });
    centerPulse.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 1600, easing: Easing.inOut(Easing.ease)}),
        withTiming(0, {duration: 1600, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      false,
    );
    waveDrift.value = withRepeat(
      withTiming(1, {duration: 6000, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
    titleSlide.value = withDelay(
      300,
      withTiming(1, {duration: 600, easing: Easing.out(Easing.ease)}),
    );
    subtitleSlide.value = withDelay(
      500,
      withTiming(1, {duration: 600, easing: Easing.out(Easing.ease)}),
    );
    badgeSlide.value = withDelay(
      700,
      withTiming(1, {duration: 600, easing: Easing.out(Easing.ease)}),
    );
  }, [entrance, centerPulse, waveDrift, titleSlide, subtitleSlide, badgeSlide]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
  }));

  const centerOrbStyle = useAnimatedStyle(() => ({
    transform: [{scale: 1 + centerPulse.value * 0.1}],
    shadowOpacity: 0.18 + centerPulse.value * 0.14,
  }));

  const centerGlowStyle = useAnimatedStyle(() => ({
    transform: [{scale: 1.5 + centerPulse.value * 0.3}],
    opacity: 0.12 + centerPulse.value * 0.1,
  }));

  const wave1Style = useAnimatedStyle(() => ({
    transform: [
      {translateX: waveDrift.value * 30 - 15},
      {translateY: waveDrift.value * 10},
    ],
    opacity: 0.08 + waveDrift.value * 0.06,
  }));

  const wave2Style = useAnimatedStyle(() => ({
    transform: [
      {translateX: waveDrift.value * -20 + 10},
      {translateY: waveDrift.value * -14 + 7},
    ],
    opacity: 0.06 + waveDrift.value * 0.05,
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
        {/* wave backdrop */}
        <AnimatedView style={[styles.wave1, wave1Style]} />
        <AnimatedView style={[styles.wave2, wave2Style]} />

        {/* connection network */}
        <View style={styles.networkContainer}>
          {/* connection lines */}
          <ConnectionLine delay={0} angle={-30} length={80} />
          <ConnectionLine delay={400} angle={45} length={70} />
          <ConnectionLine delay={800} angle={150} length={90} />
          <ConnectionLine delay={1200} angle={-60} length={60} />

          {/* surrounding avatar bubbles */}
          <AvatarBubble size={42} color={pastelColors.primary} x={-10} y={10} delay={200} icon="user" />
          <AvatarBubble size={36} color="#E48FAD" x={150} y={0} delay={400} icon="heart" />
          <AvatarBubble size={38} color="#D4739A" x={160} y={140} delay={600} icon="message-circle" />
          <AvatarBubble size={44} color={pastelColors.primary} x={-16} y={150} delay={800} icon="users" />
          <AvatarBubble size={32} color="#C45B88" x={70} y={-20} delay={1000} icon="star" />

          {/* center orb */}
          <View style={styles.centerArea}>
            <AnimatedView style={[styles.centerGlow, centerGlowStyle]} />
            <AnimatedView style={[styles.centerOrb, centerOrbStyle]}>
              <Ionicons
                name="chatbubbles"
                size={34}
                color={pastelColors.white}
              />
            </AnimatedView>
          </View>
        </View>

        {/* text content */}
        <View style={styles.textArea}>
          <AnimatedView style={titleStyle}>
            <Text style={styles.title}>Community</Text>
            <Text style={styles.titleAccent}>Coming Soon</Text>
          </AnimatedView>

          <AnimatedView style={subtitleStyle}>
            <Text style={styles.subtitle}>
              Connect with your tribe. Group chats, communities, and
              shared moments — all in one place. We're building something special.
            </Text>
          </AnimatedView>

          <AnimatedView style={[styles.badge, badgeAnimStyle]}>
            <Feather
              name="users"
              size={14}
              color={pastelColors.accent}
              style={styles.badgeIcon}
            />
            <Text style={styles.badgeText}>Building Your Circle</Text>
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
  /* waves */
  wave1: {
    position: 'absolute',
    top: 40,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: pastelColors.auth.primaryOverlay,
  },
  wave2: {
    position: 'absolute',
    bottom: 60,
    left: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: pastelColors.auth.accentOverlay,
  },
  /* network */
  networkContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  avatarBubble: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: pastelColors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 6,
  },
  connectionLine: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
    backgroundColor: pastelColors.primary,
  },
  centerArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: pastelColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: pastelColors.shadow,
    shadowRadius: 22,
    shadowOffset: {width: 0, height: 10},
    elevation: 14,
  },
  centerGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
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
