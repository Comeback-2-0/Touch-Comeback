import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ProfileStack from '../app/navigation/ProfileStack';

const mockScreenOptions: Record<string, any> = {};

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => <>{children}</>,
    Screen: ({name, options}: {name: string; options?: Record<string, any>}) => {
      mockScreenOptions[name] = options;
      return null;
    },
  }),
}));

jest.mock('../app/screens/ProfileTab', () => () => null);
jest.mock('../app/screens/EditProfile', () => () => null);
jest.mock('../app/navigation/SettingsStack', () => () => null);

describe('ProfileStack', () => {
  beforeEach(() => {
    Object.keys(mockScreenOptions).forEach(key => delete mockScreenOptions[key]);
  });

  it('keeps edit profile and settings outside the tab-owned profile stack', () => {
    act(() => {
      renderer.create(<ProfileStack />);
    });

    expect(mockScreenOptions.ProfileTabScreen).toEqual(expect.objectContaining({headerShown: false}));
    expect(mockScreenOptions.EditProfile).toBeUndefined();
    expect(mockScreenOptions.Settings).toBeUndefined();
  });
});
