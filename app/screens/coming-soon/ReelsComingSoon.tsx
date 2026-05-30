// app/screens/coming-soon/ReelsComingSoon.tsx
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
const {width: SCREEN_W, height: SCREEN_H} = Dimensions.get('window');

/* ── filmstrip frame ─────────────────────────────────────────── */
function FilmFrame({
  delay,
  x,
  y,
  width,
  height,
  opacity: baseOpacity,
}: {
  delay: number;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
}) {
  const shimmer = useSharedValue(0);
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withDelay(
      delay,
      withTiming(1, {duration: 700, easing: Easing.out(Easing.ease)}),
    );
    shimmer.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, {duration: 2200, easing: Easing.inOut(Easing.ease)}),
          withTiming(0, {duration: 2200, easing: Easing.inOut(Easing.ease)}),
        ),
        -1,
        false,
      ),
    );
  }, [shimmer, fadeIn, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: fadeIn.value * (baseOpacity + shimmer.value * 0.2),
    transform: [
      {scale: interpolate(shimmer.value, [0, 0.5, 1], [1, 1.03, 1])},
    ],
  }));

  return (
    <AnimatedView
      style={[
        styles.filmFrame,
        {
          left: x,
          top: y,
          width,
          height,
        },
        style,
      ]}
    />
  );
}

/* ── play progress bar ───────────────────────────────────────── */
function PlayProgress() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {duration: 3200, easing: Easing.linear}),
      -1,
      false,
    );
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.progressTrack}>
      <AnimatedView style={[styles.progressBar, barStyle]} />
    </View>
  );
}

/* ── music note ──────────────────────────────────────────────── */
function MusicNote({
  delay,
  startX,
  icon,
}: {
  delay: number;
  startX: number;
  icon: string;
}) {
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {duration: 3400, easing: Easing.out(Easing.ease)}),
        -1,
        false,
      ),
    );
  }, [float, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(float.value, [0, 0.3, 0.8, 1], [0, 1, 0.6, 0]),
    transform: [
      {translateY: interpolate(float.value, [0, 1], [0, -80])},
      {translateX: interpolate(float.value, [0, 0.5, 1], [0, 15, -5])},
      {rotate: `${interpolate(float.value, [0, 1], [0, 25])}deg`},
      {scale: interpolate(float.value, [0, 0.4, 1], [0.6, 1.1, 0.8])},
    ],
  }));

  return (
    <AnimatedView style={[{position: 'absolute', left: startX, bottom: 30}, style]}>
      <Feather name={icon} size={18} color={pastelColors.accent} />
    </AnimatedView>
  );
}

/* ── main screen ─────────────────────────────────────────────── */
export default function ReelsComingSoon() {
  const entrance = useSharedValue(0);
  const phoneSlide = useSharedValue(0);
  const phonePulse = useSharedValue(0);
  const titleSlide = useSharedValue(0);
  const subtitleSlide = useSharedValue(0);
  const badgeSlide = useSharedValue(0);
  const bgRotate = useSharedValue(0);

  useEffect(() => {
    entrance.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.ease),
    });
    phoneSlide.value = withDelay(
      100,
      withTiming(1, {duration: 800, easing: Easing.out(Easing.ease)}),
    );
    phonePulse.value = withDelay(
      900,
      withRepeat(
        withSequence(
          withTiming(1, {duration: 2000, easing: Easing.inOut(Easing.ease)}),
          withTiming(0, {duration: 2000, easing: Easing.inOut(Easing.ease)}),
        ),
        -1,
        false,
      ),
    );
    bgRotate.value = withRepeat(
      withTiming(1, {duration: 20000, easing: Easing.linear}),
      -1,
      false,
    );
    titleSlide.value = withDelay(
      400,
      withTiming(1, {duration: 600, easing: Easing.out(Easing.ease)}),
    );
    subtitleSlide.value = withDelay(
      600,
      withTiming(1, {duration: 600, easing: Easing.out(Easing.ease)}),
    );
    badgeSlide.value = withDelay(
      800,
      withTiming(1, {duration: 600, easing: Easing.out(Easing.ease)}),
    );
  }, [entrance, phoneSlide, phonePulse, bgRotate, titleSlide, subtitleSlide, badgeSlide]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
  }));

  const bgOrbStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${bgRotate.value * 360}deg`}],
  }));

  const phoneStyle = useAnimatedStyle(() => ({
    opacity: phoneSlide.value,
    transform: [
      {translateY: interpolate(phoneSlide.value, [0, 1], [40, 0])},
      {scale: interpolate(phonePulse.value, [0, 0.5, 1], [1, 1.04, 1])},
    ],
  }));

  const phoneGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + phonePulse.value * 0.1,
    transform: [{scale: 1.3 + phonePulse.value * 0.2}],
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
        {/* slowly rotating decorative orb ring */}
        <AnimatedView style={[styles.bgOrbRing, bgOrbStyle]}>
          <View style={styles.bgOrbDot1} />
          <View style={styles.bgOrbDot2} />
          <View style={styles.bgOrbDot3} />
        </AnimatedView>

        {/* phone / reels player mockup */}
        <View style={styles.phoneArea}>
          <AnimatedView style={[styles.phoneGlow, phoneGlowStyle]} />
          <AnimatedView style={[styles.phone, phoneStyle]}>
            {/* filmstrip frames inside phone */}
            <FilmFrame delay={200} x={12} y={14} width={56} height={44} opacity={0.5} />
            <FilmFrame delay={500} x={76} y={14} width={56} height={44} opacity={0.4} />
            <FilmFrame delay={300} x={12} y={66} width={120} height={72} opacity={0.6} />

            {/* play icon */}
            <View style={styles.playButton}>
              <Feather name="play" size={22} color={pastelColors.white} />
            </View>

            {/* progress bar */}
            <View style={styles.phoneBottom}>
              <PlayProgress />
            </View>

            {/* music notes floating */}
            <MusicNote delay={0} startX={110} icon="music" />
            <MusicNote delay={1200} startX={90} icon="music" />
            <MusicNote delay={2400} startX={125} icon="music" />
          </AnimatedView>
        </View>

        {/* text content */}
        <View style={styles.textArea}>
          <AnimatedView style={titleStyle}>
            <Text style={styles.title}>Reels</Text>
            <Text style={styles.titleAccent}>Coming Soon</Text>
          </AnimatedView>

          <AnimatedView style={subtitleStyle}>
            <Text style={styles.subtitle}>
              Short-form magic is on its way. Create, share, and vibe with
              mood-driven reels that hit different. Almost there.
            </Text>
          </AnimatedView>

          <AnimatedView style={[styles.badge, badgeAnimStyle]}>
            <Feather
              name="film"
              size={14}
              color={pastelColors.accent}
              style={styles.badgeIcon}
            />
            <Text style={styles.badgeText}>Lights, Camera, Soon!</Text>
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
  /* bg orb ring */
  bgOrbRing: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1.5,
    borderColor: pastelColors.auth.glassBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.4,
  },
  bgOrbDot1: {
    position: 'absolute',
    top: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: pastelColors.primary,
  },
  bgOrbDot2: {
    position: 'absolute',
    bottom: 20,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: pastelColors.accent,
  },
  bgOrbDot3: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: pastelColors.commentBg,
  },
  /* phone mockup */
  phoneArea: {
    width: 160,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  phoneGlow: {
    position: 'absolute',
    width: 180,
    height: 240,
    borderRadius: 30,
    backgroundColor: pastelColors.primary,
  },
  phone: {
    width: 144,
    height: 200,
    borderRadius: 20,
    backgroundColor: pastelColors.auth.glassSurfaceStrong,
    borderWidth: 1.5,
    borderColor: pastelColors.auth.glassBorder,
    overflow: 'hidden',
    shadowColor: pastelColors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 10},
    elevation: 12,
  },
  filmFrame: {
    position: 'absolute',
    borderRadius: 8,
    backgroundColor: pastelColors.auth.shimmerBase,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: pastelColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: pastelColors.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 8,
  },
  phoneBottom: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },
  progressTrack: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: pastelColors.auth.shimmerBase,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 1.5,
    backgroundColor: pastelColors.accent,
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
