import {
  checkUsername,
  completeProfile,
  fetchCurrentProfile,
  updateProfile,
  uploadProfilePicture,
} from '../app/features/profile/api/profileApi';
import {api} from '../app/utils/api';

jest.mock('../app/utils/api', () => ({
  api: {
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedApi = jest.mocked(api);

describe('profileApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches current profile from /users/me', async () => {
    mockedApi.get.mockResolvedValueOnce({data: {user: {id: 'u1'}}});

    await expect(fetchCurrentProfile()).resolves.toEqual({id: 'u1'});
    expect(mockedApi.get).toHaveBeenCalledWith('/users/me');
  });

  it('checks username availability with a normalized username path segment', async () => {
    mockedApi.get.mockResolvedValueOnce({data: {available: true}});

    await expect(checkUsername('Maya.Touch')).resolves.toEqual(true);
    expect(mockedApi.get).toHaveBeenCalledWith('/users/check-username/maya.touch');
  });

  it('sends setup and edit payloads as JSON profile updates', async () => {
    mockedApi.post.mockResolvedValueOnce({data: {user: {username: 'maya'}}});
    mockedApi.patch.mockResolvedValueOnce({data: {user: {username: 'maya2'}}});

    await completeProfile({username: 'maya', bio: 'bio', isPrivate: true});
    await updateProfile({username: 'maya2', profilePicturePublicId: 'public-id'});

    expect(mockedApi.post).toHaveBeenCalledWith('/users/complete-profile', {
      username: 'maya',
      bio: 'bio',
      isPrivate: true,
    });
    expect(mockedApi.patch).toHaveBeenCalledWith('/users/me', {
      username: 'maya2',
      profilePicturePublicId: 'public-id',
    });
  });

  it('uploads a cropped profile image as multipart form data', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: {url: 'https://cdn.example.com/profile.jpg', publicId: 'profile-id'},
    });

    await expect(
      uploadProfilePicture({
        uri: 'file:///profile.jpg',
        fileName: 'profile.jpg',
        type: 'image/jpeg',
      }),
    ).resolves.toEqual({
      url: 'https://cdn.example.com/profile.jpg',
      publicId: 'profile-id',
    });

    expect(mockedApi.post).toHaveBeenCalledWith(
      '/uploads/profile-picture',
      expect.any(FormData),
      expect.objectContaining({
        headers: {'Content-Type': 'multipart/form-data'},
        onUploadProgress: undefined,
      }),
    );
  });
});
