import React from 'react';
import {Platform, ToastAndroid} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import PublicPostCard from '../app/features/posts/components/PublicPostCard';
import {
  likePost,
  markPostNotInterested,
  reportPost,
  undoPostNotInterested,
  unlikePost,
  withdrawPostReport,
} from '../app/features/posts/api/postsApi';
import {pastelColors} from '../app/theme/colors';

jest.mock('../app/features/posts/api/postsApi', () => ({
  likePost: jest.fn(),
  markPostNotInterested: jest.fn(),
  reportPost: jest.fn(),
  undoPostNotInterested: jest.fn(),
  unlikePost: jest.fn(),
  withdrawPostReport: jest.fn(),
}));

jest.mock('../app/utils/api', () => ({
  commentOnPost: jest.fn(),
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
const mockedReportPost = jest.mocked(reportPost);
const mockedWithdrawPostReport = jest.mocked(withdrawPostReport);
const mockedMarkPostNotInterested = jest.mocked(markPostNotInterested);
const mockedUndoPostNotInterested = jest.mocked(undoPostNotInterested);
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
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'android',
    });
    jest.spyOn(ToastAndroid, 'show').mockImplementation(jest.fn());
  });

  afterEach(() => {
    if (screen) {
      act(() => {
        screen!.unmount();
      });
      screen = undefined;
    }
    jest.restoreAllMocks();
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

  it('opens an anchored safety menu from the three dots and dismisses by tapping outside', () => {
    act(() => {
      screen = renderer.create(<PublicPostCard post={makePost()} />);
    });

    act(() => {
      screen!.root.findByProps({accessibilityLabel: 'Open post options'}).props.onPress();
    });

    expect(screen!.root.findByProps({testID: 'post-options-menu'})).toBeTruthy();
    expect(screen!.root.findByProps({testID: 'post-action-not-interested'})).toBeTruthy();
    expect(screen!.root.findByProps({testID: 'post-action-report'})).toBeTruthy();
    expect(screen!.root.findByProps({testID: 'post-options-divider'})).toBeTruthy();
    expect(screen!.root.findAllByProps({children: 'Cancel'})).toHaveLength(0);
    expect(
      screen!.root.findByProps({testID: 'post-action-not-interested'}).props.style({
        pressed: true,
      }),
    ).toContainEqual(
      expect.objectContaining({backgroundColor: pastelColors.auth.primaryOverlay}),
    );

    act(() => {
      screen!.root.findByProps({testID: 'post-options-backdrop'}).props.onPress();
    });

    expect(screen!.root.findAllByProps({testID: 'post-options-menu'})).toHaveLength(0);
  });

  it('not interested replaces the card with a hidden placeholder and undo restores it', async () => {
    mockedMarkPostNotInterested.mockResolvedValueOnce({hidden: true});
    mockedUndoPostNotInterested.mockResolvedValueOnce({hidden: false});

    act(() => {
      screen = renderer.create(<PublicPostCard post={makePost()} />);
    });

    act(() => {
      screen!.root.findByProps({accessibilityLabel: 'Open post options'}).props.onPress();
    });
    await act(async () => {
      await screen!.root.findByProps({testID: 'post-action-not-interested'}).props.onPress();
    });

    expect(mockedMarkPostNotInterested).toHaveBeenCalledWith('post-1');
    expect(screen!.root.findByProps({testID: 'post-hidden-placeholder'})).toBeTruthy();
    expect(screen!.root.findAllByProps({children: 'Post hidden'}).length).toBeGreaterThan(0);

    await act(async () => {
      await screen!.root.findByProps({testID: 'post-placeholder-undo'}).props.onPress();
    });

    expect(mockedUndoPostNotInterested).toHaveBeenCalledWith('post-1');
    expect(screen!.root.findAllByProps({testID: 'post-hidden-placeholder'})).toHaveLength(0);
    expect(screen!.root.findAllByProps({children: 'ij_roy'}).length).toBeGreaterThan(0);
  });

  it('failed not interested restores the card and shows a native toast error', async () => {
    mockedMarkPostNotInterested.mockRejectedValueOnce(new Error('network'));

    act(() => {
      screen = renderer.create(<PublicPostCard post={makePost()} />);
    });

    act(() => {
      screen!.root.findByProps({accessibilityLabel: 'Open post options'}).props.onPress();
    });
    await act(async () => {
      await screen!.root.findByProps({testID: 'post-action-not-interested'}).props.onPress();
    });

    expect(screen!.root.findAllByProps({testID: 'post-hidden-placeholder'})).toHaveLength(0);
    expect(ToastAndroid.show).toHaveBeenCalledWith(
      'Could not hide post. Please try again.',
      ToastAndroid.SHORT,
    );
  });

  it('report opens a centered modal with disabled submit until a reason is selected', () => {
    act(() => {
      screen = renderer.create(<PublicPostCard post={makePost()} />);
    });

    act(() => {
      screen!.root.findByProps({accessibilityLabel: 'Open post options'}).props.onPress();
    });
    act(() => {
      screen!.root.findByProps({testID: 'post-action-report'}).props.onPress();
    });

    expect(screen!.root.findByProps({testID: 'post-report-modal'})).toBeTruthy();
    expect(screen!.root.findByProps({testID: 'post-report-submit'}).props.disabled).toBe(true);

    act(() => {
      screen!.root.findByProps({testID: 'post-report-reason-spam'}).props.onPress();
    });

    expect(screen!.root.findByProps({testID: 'post-report-submit'}).props.disabled).toBe(false);
  });

  it('successful report replaces the card with report placeholder and undo withdraws it', async () => {
    mockedReportPost.mockResolvedValueOnce({
      reported: true,
      status: 'open',
      reportsCount: 1,
      moderation: {isFlagged: true, reviewStatus: 'pending'},
    });
    mockedWithdrawPostReport.mockResolvedValueOnce({
      reported: false,
      status: 'withdrawn',
      reportsCount: 0,
      moderation: {isFlagged: false, reviewStatus: 'none'},
    });

    act(() => {
      screen = renderer.create(<PublicPostCard post={makePost()} />);
    });

    act(() => {
      screen!.root.findByProps({accessibilityLabel: 'Open post options'}).props.onPress();
    });
    act(() => {
      screen!.root.findByProps({testID: 'post-action-report'}).props.onPress();
    });
    act(() => {
      screen!.root.findByProps({testID: 'post-report-reason-spam'}).props.onPress();
      screen!.root.findByProps({testID: 'post-report-details'}).props.onChangeText('Bad post');
    });
    await act(async () => {
      await screen!.root.findByProps({testID: 'post-report-submit'}).props.onPress();
    });

    expect(mockedReportPost).toHaveBeenCalledWith('post-1', {
      reason: 'spam',
      details: 'Bad post',
    });
    expect(screen!.root.findByProps({testID: 'post-reported-placeholder'})).toBeTruthy();
    expect(screen!.root.findAllByProps({children: 'Report sent'}).length).toBeGreaterThan(0);

    await act(async () => {
      await screen!.root.findByProps({testID: 'post-placeholder-undo'}).props.onPress();
    });

    expect(mockedWithdrawPostReport).toHaveBeenCalledWith('post-1');
    expect(screen!.root.findAllByProps({testID: 'post-reported-placeholder'})).toHaveLength(0);
  });

  it('failed report keeps the report modal open with a native toast error', async () => {
    mockedReportPost.mockRejectedValueOnce(new Error('network'));

    act(() => {
      screen = renderer.create(<PublicPostCard post={makePost()} />);
    });

    act(() => {
      screen!.root.findByProps({accessibilityLabel: 'Open post options'}).props.onPress();
    });
    act(() => {
      screen!.root.findByProps({testID: 'post-action-report'}).props.onPress();
    });
    act(() => {
      screen!.root.findByProps({testID: 'post-report-reason-spam'}).props.onPress();
    });
    await act(async () => {
      await screen!.root.findByProps({testID: 'post-report-submit'}).props.onPress();
    });

    expect(screen!.root.findByProps({testID: 'post-report-modal'})).toBeTruthy();
    expect(ToastAndroid.show).toHaveBeenCalledWith(
      'Could not send report. Please try again.',
      ToastAndroid.SHORT,
    );
  });

  it('opens comments from the comment action', () => {
    act(() => {
      screen = renderer.create(<PublicPostCard post={makePost()} />);
    });

    act(() => {
      screen!.root.findByProps({testID: 'post-comment-action'}).props.onPress();
    });

    expect(screen!.root.findByProps({testID: 'post-comments-sheet'})).toBeTruthy();
  });
});
