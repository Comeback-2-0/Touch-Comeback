import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ImagePicker from 'react-native-image-crop-picker';
import CreatePostScreen from '../app/screens/CreatePostScreen';
import {useCreatePost} from '../app/features/posts/hooks/useCreatePost';

const mockMutateAsync = jest.fn();
const mockGoBack = jest.fn();

const selectedImages = [
  {uri: 'file:///one.jpg', fileName: 'one.jpg', type: 'image/jpeg'},
  {uri: 'file:///two.jpg', fileName: 'two.jpg', type: 'image/jpeg'},
];

jest.mock('../app/features/posts/hooks/useCreatePost', () => ({
  useCreatePost: jest.fn(),
}));

jest.mock('react-native-image-crop-picker', () => ({
  openCropper: jest.fn(),
}));

jest.mock('react-native-vector-icons/Feather', () => {
  const {Text} = require('react-native');
  return ({name}: {name: string}) => <Text>{name}</Text>;
});

describe('CreatePostScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useCreatePost).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
      progress: 0,
    } as any);
  });

  it('renders selected square image previews before the caption field', () => {
    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(
        <CreatePostScreen
          navigation={{goBack: mockGoBack} as any}
          route={{params: {images: selectedImages}} as any}
        />,
      );
    });

    expect(screen!.root.findByProps({testID: 'selected-post-image-0'})).toBeTruthy();
    expect(screen!.root.findByProps({testID: 'selected-post-image-1'})).toBeTruthy();
    expect(screen!.root.findByProps({testID: 'create-post-caption'}).props.placeholder).toBe(
      'Write a caption...',
    );
    expect(screen!.root.findByProps({testID: 'create-post-submit'})).toBeTruthy();
    expect(screen!.root.findAllByProps({children: "What's on your mind?"})).toHaveLength(0);
    expect(screen!.root.findAllByProps({children: '0/2000'})).toHaveLength(0);
  });

  it('allows a selected image to be adjusted with the cropper', async () => {
    jest.mocked(ImagePicker.openCropper).mockResolvedValueOnce({
      path: 'file:///adjusted.jpg',
      mime: 'image/jpeg',
    } as any);

    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(
        <CreatePostScreen
          navigation={{goBack: mockGoBack} as any}
          route={{params: {images: selectedImages}} as any}
        />,
      );
    });

    await act(async () => {
      await screen!.root.findByProps({testID: 'adjust-post-image-0'}).props.onPress();
    });

    expect(ImagePicker.openCropper).toHaveBeenCalledWith(
      expect.objectContaining({path: 'file:///one.jpg', cropping: true, width: 1080, height: 1080}),
    );
  });

  it('submits selected images with a trimmed caption and returns to the previous screen', async () => {
    mockMutateAsync.mockResolvedValueOnce({id: 'p1'});
    let screen: renderer.ReactTestRenderer;

    act(() => {
      screen = renderer.create(
        <CreatePostScreen
          navigation={{goBack: mockGoBack} as any}
          route={{params: {images: selectedImages}} as any}
        />,
      );
    });

    act(() => {
      screen!.root.findByProps({testID: 'create-post-caption'}).props.onChangeText('  Caption  ');
    });

    await act(async () => {
      await screen!.root.findByProps({testID: 'create-post-submit'}).props.onPress();
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({text: 'Caption', images: selectedImages});
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
