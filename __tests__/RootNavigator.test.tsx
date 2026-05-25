import React from 'react';
import renderer, {act} from 'react-test-renderer';
import RootNavigator from '../app/navigation/RootNavigator';
import {useAuth} from '../app/context/AuthContext';

jest.mock('../app/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => <>{children}</>,
    Screen: ({component: Component}: {component: React.ComponentType}) => (
      <Component />
    ),
  }),
}));

jest.mock('../app/navigation/AppStack', () => () => null);
jest.mock('../app/navigation/AuthStack', () => () => null);

jest.mock('react-native-reanimated', () => {
  const {View, Text} = require('react-native');

  return {
    __esModule: true,
    default: {
      View,
      Text,
      createAnimatedComponent: (component: React.ComponentType) => component,
    },
    Easing: {
      inOut: jest.fn(easing => easing),
      ease: jest.fn(),
    },
    interpolate: jest.fn(() => 1),
    useAnimatedStyle: jest.fn(factory => factory()),
    useSharedValue: jest.fn(value => ({value})),
    withDelay: jest.fn((_delay, value) => value),
    withRepeat: jest.fn(value => value),
    withSequence: jest.fn((...values) => values[values.length - 1]),
    withSpring: jest.fn(value => value),
    withTiming: jest.fn(value => value),
  };
});

describe('RootNavigator', () => {
  it('renders a branded skeleton loading screen while auth restores', () => {
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    });

    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(<RootNavigator />);
    });

    expect(screen!.root.findByProps({testID: 'auth-loading-screen'})).toBeTruthy();
    expect(screen!.root.findAllByProps({testID: 'auth-skeleton-bar'}).length).toBeGreaterThan(1);
    expect(screen!.root.findByProps({testID: 'auth-loading-status'}).props.children).toBe(
      'Getting Touch ready...',
    );
  });
});
