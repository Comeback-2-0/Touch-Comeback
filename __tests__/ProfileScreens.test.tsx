import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ProfileSetupScreen from '../app/screens/ProfileSetupScreen';
import ProfileScreen from '../app/screens/ProfileTab';
import EditProfile from '../app/screens/EditProfile';
import {useCurrentProfile} from '../app/features/profile/hooks/useCurrentProfile';
import {useCompleteProfile, useUpdateProfile, useUploadProfilePicture} from '../app/features/profile/hooks/useProfileMutations';

jest.mock('../app/features/profile/hooks/useCurrentProfile', () => ({
  useCurrentProfile: jest.fn(),
}));

jest.mock('../app/features/profile/hooks/useProfileMutations', () => ({
  useCompleteProfile: jest.fn(),
  useUpdateProfile: jest.fn(),
  useUploadProfilePicture: jest.fn(),
}));

jest.mock('../app/features/profile/hooks/useUsernameAvailability', () => ({
  normalizeUsername: (value: string) => value.trim().toLowerCase(),
  useUsernameAvailability: () => ({
    available: true,
    isChecking: false,
    isValidFormat: true,
    message: 'Username is available',
  }),
}));

jest.mock('../app/features/profile/hooks/useProfileImagePicker', () => ({
  useProfileImagePicker: () => ({
    image: null,
    pickImage: jest.fn(),
    clearImage: jest.fn(),
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

jest.mock('react-native-vector-icons/Ionicons', () => {
  const {Text} = require('react-native');
  return ({name}: {name: string}) => <Text>{name}</Text>;
});

const profile = {
  id: 'u1',
  username: 'maya',
  bio: 'Mood-led conversations.',
  profilePicture: 'https://cdn.example.com/profile.jpg',
  isPrivate: true,
  followersCount: 12,
  followingCount: 8,
  postsCount: 5,
  isProfileComplete: true,
};

describe('profile screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useCurrentProfile).mockReturnValue({
      data: profile,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as any);
    jest.mocked(useCompleteProfile).mockReturnValue({mutateAsync: jest.fn(), isPending: false, error: null} as any);
    jest.mocked(useUpdateProfile).mockReturnValue({mutateAsync: jest.fn(), isPending: false, error: null} as any);
    jest.mocked(useUploadProfilePicture).mockReturnValue({mutateAsync: jest.fn(), isPending: false, error: null, progress: 0} as any);
  });

  it('renders profile data and future placeholders', () => {
    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(<ProfileScreen />);
    });

    expect(screen!.root.findByProps({testID: 'profile-username'}).props.children).toContain('maya');
    expect(screen!.root.findByProps({testID: 'profile-bio'}).props.children).toBe('Mood-led conversations.');
    expect(screen!.root.findByProps({testID: 'profile-posts-placeholder'})).toBeTruthy();
    expect(screen!.root.findByProps({testID: 'profile-saved-placeholder'})).toBeTruthy();
  });

  it('disables setup continue until the username is entered', () => {
    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(<ProfileSetupScreen />);
    });

    expect(screen!.root.findByProps({testID: 'profile-submit-button'}).props.accessibilityState).toEqual({
      busy: false,
      disabled: true,
    });
  });

  it('renders edit profile with a JSON save action', () => {
    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(<EditProfile />);
    });

    expect(screen!.root.findByProps({testID: 'profile-form-username'}).props.value).toBe('maya');
    expect(screen!.root.findByProps({testID: 'profile-submit-label'}).props.children).toBe('Save Changes');
  });
});
