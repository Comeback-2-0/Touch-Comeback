import React from 'react';
import renderer, {act} from 'react-test-renderer';
import SettingsScreen from '../app/screens/Settings';
import {useAuth} from '../app/context/AuthContext';

const mockNavigate = jest.fn();
const mockSignOut = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../app/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-native-vector-icons/Ionicons', () => {
  const {Text} = require('react-native');
  return ({name}: {name: string}) => <Text>{name}</Text>;
});

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: jest.fn(),
      signOut: mockSignOut,
    });
  });

  it('calls signOut when the logout row is pressed', () => {
    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(<SettingsScreen />);
    });

    act(() => {
      screen.root.findByProps({testID: 'logout-button'}).props.onPress();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
