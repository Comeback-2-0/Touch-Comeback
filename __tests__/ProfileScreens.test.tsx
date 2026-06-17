import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ProfileSetupScreen from '../app/screens/ProfileSetupScreen';
import ProfileScreen from '../app/screens/ProfileTab';
import EditProfile from '../app/screens/EditProfile';
import {useCurrentProfile} from '../app/features/profile/hooks/useCurrentProfile';
import {useCompleteProfile, useUpdateProfile, useUploadProfilePicture} from '../app/features/profile/hooks/useProfileMutations';
import {useAuth} from '../app/context/AuthContext';
import {useUserPosts} from '../app/features/posts/hooks/useUserPosts';

const mockCompleteProfile = jest.fn();
const mockUpdateProfile = jest.fn();
const mockUploadProfilePicture = jest.fn();
const mockSignOut = jest.fn();

jest.mock('../app/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

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

jest.mock('../app/features/posts/hooks/useUserPosts', () => ({
  useUserPosts: jest.fn(),
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

jest.mock('react-native-vector-icons/Feather', () => {
  const {Text} = require('react-native');
  return ({name}: {name: string}) => <Text>{name}</Text>;
});

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const {Text} = require('react-native');
  return ({name}: {name: string}) => <Text>{name}</Text>;
});

const profile = {
  id: 'u1',
  name: 'Maya Profile',
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
    jest.mocked(useAuth).mockReturnValue({
      user: {
        _id: 'u1',
        name: 'Maya Google',
        email: 'maya@example.com',
        photo: 'https://googleusercontent.com/maya.jpg',
      },
      loading: false,
      signInWithGoogle: jest.fn(),
      signOut: mockSignOut,
    });
    jest.mocked(useCurrentProfile).mockReturnValue({
      data: profile,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as any);
    jest.mocked(useUserPosts).mockReturnValue({
      data: {posts: [], nextCursor: null},
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetch: jest.fn(),
    } as any);
    mockCompleteProfile.mockResolvedValue(profile);
    mockUpdateProfile.mockResolvedValue(profile);
    mockUploadProfilePicture.mockResolvedValue({
      url: 'https://cdn.example.com/uploaded.jpg',
      publicId: 'uploaded-id',
    });
    jest.mocked(useCompleteProfile).mockReturnValue({mutateAsync: mockCompleteProfile, isPending: false, error: null} as any);
    jest.mocked(useUpdateProfile).mockReturnValue({mutateAsync: mockUpdateProfile, isPending: false, error: null} as any);
    jest.mocked(useUploadProfilePicture).mockReturnValue({mutateAsync: mockUploadProfilePicture, isPending: false, error: null, progress: 0} as any);
  });

  it('renders profile data and future placeholders', () => {
    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(<ProfileScreen />);
    });

    expect(screen!.root.findByProps({testID: 'profile-username'}).props.children).toContain('maya');
    expect(screen!.root.findByProps({testID: 'profile-name'}).props.children).toBe('Maya Profile');
    expect(screen!.root.findByProps({testID: 'profile-bio'}).props.children).toBe('Mood-led conversations.');
    expect(screen!.root.findByProps({testID: 'profile-posts-placeholder'})).toBeTruthy();
    expect(screen!.root.findByProps({testID: 'profile-saved-placeholder'})).toBeTruthy();
    expect(screen!.root.findAllByProps({children: 'settings'}).length).toBeGreaterThan(0);
  });

  it('disables setup continue until the username is entered', () => {
    jest.mocked(useCurrentProfile).mockReturnValue({
      data: {
        ...profile,
        username: '',
        bio: '',
        profilePicture: '',
        isProfileComplete: false,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as any);
    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(<ProfileSetupScreen />);
    });

    expect(screen!.root.findByProps({testID: 'profile-submit-button'}).props.accessibilityState).toEqual({
      busy: false,
      disabled: true,
    });
  });

  it('prefills setup from saved partial profile and shows read-only google email', () => {
    jest.mocked(useCurrentProfile).mockReturnValue({
      data: {
        ...profile,
        username: 'partial_user',
        bio: 'Already wrote this',
        profilePicture: '',
        isProfileComplete: false,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as any);
    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(<ProfileSetupScreen />);
    });

    expect(screen!.root.findByProps({testID: 'profile-account-email'}).props.children).toBe(
      'maya@example.com',
    );
    expect(screen!.root.findByProps({testID: 'profile-form-username'}).props.value).toBe(
      'partial_user',
    );
    expect(screen!.root.findByProps({testID: 'profile-form-name'}).props.value).toBe(
      'Maya Profile',
    );
    expect(screen!.root.findByProps({testID: 'profile-form-bio'}).props.value).toBe(
      'Already wrote this',
    );
  });

  it('orders setup fields as picture, name, username, email, bio, then privacy', () => {
    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(<ProfileSetupScreen />);
    });

    const fieldOrder = Array.from(new Set(screen!.root
      .findAll(node => typeof node.props.testID === 'string' && node.props.testID.startsWith('profile-field-'))
      .map(node => node.props.testID)));

    expect(fieldOrder).toEqual([
      'profile-field-picture',
      'profile-field-name',
      'profile-field-username',
      'profile-field-email',
      'profile-field-bio',
      'profile-field-private',
    ]);
  });

  it('removes low-value helper copy from setup form', () => {
    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(<ProfileSetupScreen />);
    });

    expect(
      screen!.root.findAllByProps({children: 'Tap to pick and crop a square image'}),
    ).toHaveLength(0);
    expect(
      screen!.root.findAllByProps({children: 'Approve who can follow you.'}),
    ).toHaveLength(0);
  });

  it('uses the google profile photo as the setup avatar fallback when no profile image is saved', () => {
    jest.mocked(useCurrentProfile).mockReturnValue({
      data: {
        ...profile,
        username: 'partial_user',
        profilePicture: '',
        isProfileComplete: false,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as any);
    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(<ProfileSetupScreen />);
    });

    expect(screen!.root.findByProps({testID: 'profile-avatar-image'}).props.source).toEqual({
      uri: 'https://googleusercontent.com/maya.jpg',
    });
  });

  it('submits the google profile photo when the user completes setup without picking a new image', async () => {
    jest.mocked(useCurrentProfile).mockReturnValue({
      data: {
        ...profile,
        username: 'partial_user',
        bio: 'Already wrote this',
        profilePicture: '',
        isProfileComplete: false,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as any);
    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(<ProfileSetupScreen />);
    });

    await act(async () => {
      await screen!.root.findByProps({testID: 'profile-submit-button'}).props.onPress();
    });

    expect(mockUploadProfilePicture).not.toHaveBeenCalled();
    expect(mockCompleteProfile).toHaveBeenCalledWith({
      name: 'Maya Profile',
      username: 'partial_user',
      bio: 'Already wrote this',
      isPrivate: true,
      profilePicture: 'https://googleusercontent.com/maya.jpg',
    });
  });

  it('lets the user switch to a different google account from setup', async () => {
    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(<ProfileSetupScreen />);
    });

    await act(async () => {
      await screen!.root.findByProps({testID: 'profile-switch-google-account'}).props.onPress();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
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
