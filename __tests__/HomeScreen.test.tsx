import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ImagePicker from 'react-native-image-crop-picker';
import HomeScreen from '../app/screens/HomeScreen';
import {useHomeFeed} from '../app/features/posts/hooks/useHomeFeed';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../app/features/posts/hooks/useHomeFeed', () => ({
  useHomeFeed: jest.fn(),
}));

jest.mock('react-native-image-crop-picker', () => ({
  openPicker: jest.fn(),
}));

jest.mock('react-native-vector-icons/Feather', () => {
  const {Text} = require('react-native');
  const MockFeather = ({name}: {name: string}) => <Text>{name}</Text>;
  MockFeather.iconFamily = 'Feather';
  return MockFeather;
});

jest.mock('react-native-vector-icons/Ionicons', () => {
  const {Text} = require('react-native');
  const MockIonicons = ({name}: {name: string}) => <Text>{name}</Text>;
  MockIonicons.iconFamily = 'Ionicons';
  return MockIonicons;
});

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const {Text} = require('react-native');
  return ({name}: {name: string}) => <Text>{name}</Text>;
});

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useHomeFeed).mockReturnValue({
      data: {posts: [], nextCursor: null},
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetch: jest.fn(),
    } as any);
  });

  it('uses the Touch logo and requested header icons without subtitle copy', () => {
    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(<HomeScreen />);
    });

    expect(screen!.root.findByProps({testID: 'home-logo'})).toBeTruthy();
    expect(screen!.root.findAllByProps({children: 'Home'})).toHaveLength(0);
    expect(screen!.root.findAllByProps({children: 'Public posts from Touch users'})).toHaveLength(0);
    expect(screen!.root.findByProps({testID: 'home-create-post'})).toBeTruthy();
    expect(screen!.root.findByProps({testID: 'home-notifications'})).toBeTruthy();
  });

  it('opens gallery directly from plus-square and navigates with selected images', async () => {
    jest.mocked(ImagePicker.openPicker).mockResolvedValueOnce([
      {path: 'file:///one.jpg', mime: 'image/jpeg'},
      {path: 'file:///two.jpg', mime: 'image/jpeg'},
    ] as any);

    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(<HomeScreen />);
    });

    await act(async () => {
      await screen!.root.findByProps({testID: 'home-create-post'}).props.onPress();
    });

    expect(ImagePicker.openPicker).toHaveBeenCalledWith(
      expect.objectContaining({mediaType: 'photo', multiple: true, maxFiles: 10}),
    );
    expect(mockNavigate).toHaveBeenCalledWith('CreatePost', {
      images: [
        {uri: 'file:///one.jpg', fileName: 'one.jpg', type: 'image/jpeg'},
        {uri: 'file:///two.jpg', fileName: 'two.jpg', type: 'image/jpeg'},
      ],
    });
  });

  it('opens the notification placeholder from the notification icon', () => {
    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(<HomeScreen />);
    });

    act(() => {
      screen!.root.findByProps({testID: 'home-notifications'}).props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('Notifications');
  });
});
