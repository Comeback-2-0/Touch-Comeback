import React from 'react';
import renderer, {act} from 'react-test-renderer';
import SettingsStack from '../app/navigation/SettingsStack';

const mockScreenNames: string[] = [];

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => <>{children}</>,
    Screen: ({name}: {name: string}) => {
      mockScreenNames.push(name);
      return null;
    },
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('../app/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signInWithGoogle: jest.fn(),
    signOut: jest.fn(),
  }),
}));

jest.mock('react-native-vector-icons/Ionicons', () => {
  const {Text} = require('react-native');
  return ({name}: {name: string}) => <Text>{name}</Text>;
});

describe('SettingsStack', () => {
  beforeEach(() => {
    mockScreenNames.length = 0;
  });

  it('uses a unique route name for the settings landing screen', () => {
    act(() => {
      renderer.create(<SettingsStack />);
    });

    expect(mockScreenNames).toContain('SettingsHome');
    expect(mockScreenNames).not.toContain('Settings');
  });
});
