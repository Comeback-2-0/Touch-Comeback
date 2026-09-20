import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

type Props = {
  text: string;
  active: boolean;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  maxFontSizeMultiplier?: number;
  onManualDrag?: () => void;
};

export default function PreviewMarqueeText({
  text,
  active,
  style,
  containerStyle,
  maxFontSizeMultiplier = 1.35,
  onManualDrag,
}: Props) {
  const offset = useRef(new Animated.Value(0)).current;
  const offsetValue = useRef(0);
  const dragStart = useRef(0);
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const overflow = Math.max(0, contentWidth - viewportWidth);
  const canScroll = overflow > 4;

  useEffect(() => {
    const id = offset.addListener(({value}) => {
      offsetValue.current = value;
    });
    return () => offset.removeListener(id);
  }, [offset]);

  useEffect(() => {
    loopRef.current?.stop();
    loopRef.current = null;
    offset.stopAnimation();

    if (!active || !canScroll) {
      Animated.timing(offset, {toValue: 0, duration: 180, useNativeDriver: true}).start();
      return undefined;
    }

    offset.setValue(0);
    const travel = overflow + 28;
    const duration = Math.min(14000, Math.max(2800, travel * 28));
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(420),
        Animated.timing(offset, {
          toValue: -travel,
          duration,
          useNativeDriver: true,
        }),
        Animated.delay(700),
        Animated.timing(offset, {
          toValue: 0,
          duration: 520,
          useNativeDriver: true,
        }),
      ]),
    );
    loopRef.current = loop;
    loop.start();
    return () => {
      loop.stop();
      loopRef.current = null;
    };
  }, [active, canScroll, offset, overflow]);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, gesture) =>
        active && canScroll && Math.abs(gesture.dx) > 4 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: () => {
        loopRef.current?.stop();
        loopRef.current = null;
        onManualDrag?.();
        offset.stopAnimation(value => {
          offsetValue.current = value;
          dragStart.current = value;
        });
      },
      onPanResponderMove: (_e, gesture) => {
        const next = Math.min(0, Math.max(-overflow, dragStart.current + gesture.dx));
        offset.setValue(next);
      },
      onPanResponderRelease: (_e, gesture) => {
        const next = Math.min(0, Math.max(-overflow, dragStart.current + gesture.dx));
        offset.setValue(next);
      },
    }),
  ).current;

  return (
    <View
      style={[styles.clip, containerStyle]}
      onLayout={event => setViewportWidth(event.nativeEvent.layout.width)}
      {...(active && canScroll ? pan.panHandlers : {})}>
      <Animated.View style={{transform: [{translateX: offset}]}}>
        <Text
          numberOfLines={1}
          style={style}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          onLayout={event => setContentWidth(event.nativeEvent.layout.width)}>
          {text}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
    width: '100%',
  },
});
