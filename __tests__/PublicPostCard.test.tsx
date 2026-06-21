import React from 'react';
import renderer, {act} from 'react-test-renderer';
import PublicPostCard from '../app/features/posts/components/PublicPostCard';
import {likePost, unlikePost} from '../app/features/posts/api/postsApi';
import {pastelColors} from '../app/theme/colors';

jest.mock('../app/features/posts/api/postsApi', () => ({
  likePost: jest.fn(),
  unlikePost: jest.fn(),
}));

jest.mock('react-native-vector-icons/Ionicons', () => {
  const {Text} = require('react-native');
  return ({name, ...props}: {name: string}) => <Text {...props}>{name}</Text>;
});

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const {Text} = require('react-native');
  return ({name}: {name: string}) => <Text>{name}</Text>;
});

const mockedLikePost = jest.mocked(likePost);
const mockedUnlikePost = jest.mocked(unlikePost);
let screen: renderer.ReactTestRenderer | undefined;

function makePost(overrides: Record<string, unknown> = {}) {
  return {
    id: 'post-1',
    author: {
      id: 'user-1',
      name: 'Indrajit Roy',
      username: 'ij_roy',
      profilePicture: 'https://cdn.example.com/avatar.jpg',
    },
    text: 'A caption',
    media: [
      {
        type: 'image',
        url: 'https://cdn.example.com/post.jpg',
        publicId: 'touch/posts/post',
      },
    ],
    visibility: 'public',
    status: 'active',
    engagement: {
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      savesCount: 0,
      reportsCount: 0,
    },
    viewerEngagement: {liked: false},
    createdAt: '2026-06-18T00:00:00.000Z',
    updatedAt: '2026-06-18T00:00:00.000Z',
    ...overrides,
  } as any;
}

describe('PublicPostCard likes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (screen) {
      act(() => {
        screen!.unmount();
      });
      screen = undefined;
    }
  });

  it('optimistically likes from the like action and reconciles with the server count', async () => {
    mockedLikePost.mockResolvedValueOnce({liked: true, likesCount: 5});

    act(() => {
      screen = renderer.create(<PublicPostCard post={makePost()} />);
    });

    await act(async () => {
      await screen!.root.findByProps({accessibilityLabel: 'Like post'}).props.onPress();
    });

    expect(mockedLikePost).toHaveBeenCalledWith('post-1');
    expect(screen!.root.findByProps({accessibilityLabel: 'Unlike post'})).toBeTruthy();
    expect(screen!.root.findAllByProps({children: '5'}).length).toBeGreaterThan(0);
  });

  it('rolls back an optimistic unlike when the request fails', async () => {
    mockedUnlikePost.mockRejectedValueOnce(new Error('network'));

    act(() => {
      screen = renderer.create(
        <PublicPostCard
          post={makePost({
            engagement: {
              likesCount: 3,
              commentsCount: 0,
              sharesCount: 0,
              savesCount: 0,
              reportsCount: 0,
            },
            viewerEngagement: {liked: true},
          })}
        />,
      );
    });

    await act(async () => {
      await screen!.root.findByProps({accessibilityLabel: 'Unlike post'}).props.onPress();
    });

    expect(mockedUnlikePost).toHaveBeenCalledWith('post-1');
    expect(screen!.root.findByProps({accessibilityLabel: 'Unlike post'})).toBeTruthy();
    expect(screen!.root.findAllByProps({children: '3'}).length).toBeGreaterThan(0);
  });

  it('double-tapping media likes once and uses the media-only target', async () => {
    mockedLikePost.mockResolvedValueOnce({liked: true, likesCount: 1});

    act(() => {
      screen = renderer.create(<PublicPostCard post={makePost()} />);
    });

    await act(async () => {
      const mediaTarget = screen!.root.findByProps({testID: 'post-media-touch-target'});
      mediaTarget.props.onPress();
      await mediaTarget.props.onPress();
    });

    expect(mockedLikePost).toHaveBeenCalledTimes(1);
    expect(mockedLikePost).toHaveBeenCalledWith('post-1');
    expect(screen!.root.findByProps({testID: 'post-like-burst'})).toBeTruthy();
  });

  it('uses the app primary color for the liked icon and double-tap heart', async () => {
    mockedLikePost.mockResolvedValueOnce({liked: true, likesCount: 1});

    act(() => {
      screen = renderer.create(<PublicPostCard post={makePost()} />);
    });

    await act(async () => {
      await screen!.root.findByProps({accessibilityLabel: 'Like post'}).props.onPress();
    });

    expect(screen!.root.findByProps({testID: 'post-liked-icon'}).props.color).toBe(
      pastelColors.primary,
    );
    expect(screen!.root.findByProps({testID: 'post-like-burst-icon'}).props.color).toBe(
      pastelColors.primary,
    );
  });

  it('does not send duplicate like requests while a mutation is in flight', async () => {
    let resolveLike: ((value: {liked: boolean; likesCount: number}) => void) | undefined;
    mockedLikePost.mockReturnValueOnce(
      new Promise(resolve => {
        resolveLike = resolve;
      }),
    );

    act(() => {
      screen = renderer.create(<PublicPostCard post={makePost()} />);
    });

    await act(async () => {
      const likeButton = screen!.root.findByProps({accessibilityLabel: 'Like post'});
      likeButton.props.onPress();
      likeButton.props.onPress();
    });

    expect(mockedLikePost).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveLike?.({liked: true, likesCount: 1});
    });
  });
});
