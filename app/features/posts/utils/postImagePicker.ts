import ImagePicker from 'react-native-image-crop-picker';
import type {LocalPostImage} from '../types';

const POST_IMAGE_PICKER_OPTIONS = {
  mediaType: 'photo' as const,
  compressImageQuality: 0.88,
  includeExif: false,
  cropping: true,
  width: 1080,
  height: 1080,
};

function normalizePickedImage(picked: {path: string; mime?: string}): LocalPostImage {
  const fileName = picked.path.split('/').pop() || 'post-image.jpg';
  return {
    uri: picked.path,
    fileName,
    type: picked.mime || 'image/jpeg',
  };
}

export async function pickPostImages(): Promise<LocalPostImage[]> {
  const picked = await ImagePicker.openPicker({
    ...POST_IMAGE_PICKER_OPTIONS,
    multiple: true,
    maxFiles: 10,
  });

  const images = Array.isArray(picked) ? picked : [picked];
  return images.slice(0, 10).map(normalizePickedImage);
}

export async function capturePostImage(): Promise<LocalPostImage[]> {
  const picked = await ImagePicker.openCamera(POST_IMAGE_PICKER_OPTIONS);
  return [normalizePickedImage(picked)];
}

export async function adjustPostImage(image: LocalPostImage): Promise<LocalPostImage> {
  const picked = await ImagePicker.openCropper({
    ...POST_IMAGE_PICKER_OPTIONS,
    path: image.uri,
  });

  return normalizePickedImage(picked);
}
