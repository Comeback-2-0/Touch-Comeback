import {useCallback, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  findNodeHandle,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  UIManager,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
} from 'react-native';

const FIELD_GAP = 28;
const RESTING_PAD = 48;

export function extraScrollPadding(keyboardHeight: number) {
  return keyboardHeight > 0 ? keyboardHeight + FIELD_GAP : RESTING_PAD;
}

export function scrollOffsetToRevealField(
  currentOffset: number,
  fieldBottom: number,
  visibleBottom: number,
) {
  const overflow = fieldBottom - visibleBottom;
  if (overflow <= 0) return Math.max(0, currentOffset);
  return currentOffset + overflow;
}

function nativeHandle(event: NativeSyntheticEvent<TextInputFocusEventData>) {
  const target = (event as {target?: unknown}).target ?? event.nativeEvent?.target;
  if (typeof target === 'number') return target;
  return findNodeHandle(target as Parameters<typeof findNodeHandle>[0]);
}

export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => setKeyboardHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return keyboardHeight;
}

export function useKeyboardAwareScroll() {
  const scrollRef = useRef<ScrollView>(null);
  const offsetY = useRef(0);
  const keyboardHeight = useKeyboardHeight();

  const onInputFocus = useCallback((event: NativeSyntheticEvent<TextInputFocusEventData>) => {
    const handle = nativeHandle(event);
    const delay = Platform.OS === 'ios' ? 60 : 320;
    setTimeout(() => {
      const kb = Keyboard.metrics()?.height || keyboardHeight;
      const visibleBottom = Dimensions.get('window').height - kb - FIELD_GAP;
      if (!handle) {
        scrollRef.current?.scrollToEnd({animated: true});
        return;
      }
      UIManager.measureInWindow(handle, (_x, y, _width, height) => {
        const nextY = scrollOffsetToRevealField(offsetY.current, y + height, visibleBottom);
        if (nextY !== offsetY.current) {
          scrollRef.current?.scrollTo({y: nextY, animated: true});
        }
      });
    }, delay);
  }, [keyboardHeight]);

  return {
    scrollRef,
    onInputFocus,
    keyboardHeight,
    contentPadding: {paddingBottom: extraScrollPadding(keyboardHeight)},
    KeyboardAvoidingView,
    keyboardAvoidingProps: {
      style: {flex: 1} as const,
      behavior: 'padding' as const,
      keyboardVerticalOffset: Platform.OS === 'ios' ? 8 : 0,
    },
    scrollProps: {
      keyboardShouldPersistTaps: 'handled' as const,
      keyboardDismissMode: 'interactive' as const,
      automaticallyAdjustKeyboardInsets: true,
      showsVerticalScrollIndicator: false as const,
      onScroll: (event: {nativeEvent: {contentOffset: {y: number}}}) => {
        offsetY.current = event.nativeEvent.contentOffset.y;
      },
      scrollEventThrottle: 16,
    },
  };
}
