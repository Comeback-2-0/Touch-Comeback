/**
 * @format
 */

import 'react-native';
import React from 'react';
import {StatusBar} from 'react-native';

// Note: import explicitly to use the types shipped with jest.
import {it} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer, {act} from 'react-test-renderer';
import SplashScreen from 'react-native-splash-screen';
import App from '../App';

jest.mock('../app/utils/googleConfig', () => ({}));

jest.mock('react-native-splash-screen', () => ({
  hide: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  const {View} = require('react-native');

  return {
    NavigationContainer: ({children}: {children: React.ReactNode}) => (
      <View>{children}</View>
    ),
  };
});

jest.mock('../app/context/AuthContext', () => {
  const {View} = require('react-native');

  return {
    AuthProvider: ({children}: {children: React.ReactNode}) => (
      <View>{children}</View>
    ),
  };
});

jest.mock('../app/navigation/RootNavigator', () => {
  const {View} = require('react-native');

  return function MockRootNavigator() {
    return <View testID="root-navigator" />;
  };
});

it('renders correctly', () => {
  act(() => {
    renderer.create(<App />);
  });
});

it('hides the native splash screen after React mounts', () => {
  act(() => {
    renderer.create(<App />);
  });

  expect(SplashScreen.hide).toHaveBeenCalled();
});

it('applies a transparent edge-to-edge status bar for the light app theme', () => {
  let screen: renderer.ReactTestRenderer;

  act(() => {
    screen = renderer.create(<App />);
  });

  const statusBar = screen!.root.findByType(StatusBar);
  expect(statusBar.props.translucent).toBe(true);
  expect(statusBar.props.backgroundColor).toBe('transparent');
  expect(statusBar.props.barStyle).toBe('dark-content');
});
