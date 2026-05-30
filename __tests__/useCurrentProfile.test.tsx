import React from 'react';
import {useQuery} from '@tanstack/react-query';
import renderer, {act} from 'react-test-renderer';
import {useCurrentProfile} from '../app/features/profile/hooks/useCurrentProfile';
import {useAuthStore} from '../app/features/profile/store/authStore';

const profile = {
  id: 'u1',
  name: 'Maya',
  username: 'maya',
  bio: '',
  profilePicture: '',
  isPrivate: false,
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  isProfileComplete: true,
};

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: profile,
    isLoading: false,
    isError: false,
  })),
}));

function Probe() {
  useCurrentProfile({enabled: true});
  return null;
}

describe('useCurrentProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.getState().resetAuth();
  });

  it('does not update Zustand from React Query select during render', () => {
    act(() => {
      renderer.create(<Probe />);
    });

    expect(jest.mocked(useQuery).mock.calls[0][0]).not.toHaveProperty('select');
    expect(useAuthStore.getState().profile).toEqual(profile);
  });
});
