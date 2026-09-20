import ImagePicker from 'react-native-image-crop-picker';
import type {LocalPostImage} from '../types';
import {adjustPhoto, pickPhotos} from '../../../utils/mediaCrop';

export async function pickPostImages(): Promise<LocalPostImage[]> {
  return pickPhotos({surface: 'post', multiple: true, maxFiles: 10});
}

export async function capturePostImage(): Promise<LocalPostImage[]> {
  const picked = await ImagePicker.openCamera({
    mediaType: 'photo',
    compressImageQuality: 0.88,
    includeExif: false,
    cropping: false,
  });
  return [
    {
      uri: picked.path,
      fileName: picked.path.split('/').pop() || 'post-image.jpg',
      type: picked.mime || 'image/jpeg',
    },
  ];
}

export async function adjustPostImage(image: LocalPostImage): Promise<LocalPostImage> {
  return adjustPhoto(image, 'post');
}
