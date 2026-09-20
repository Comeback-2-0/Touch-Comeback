import {Platform, StatusBar} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

export type MediaCropSurface =
  | 'post'
  | 'profile'
  | 'communityCover'
  | 'communityCompose'
  | 'bugReport';

export type LocalMediaImage = {
  uri: string;
  fileName: string;
  type: string;
};

const SURFACE_CROP: Record<
  MediaCropSurface,
  {width: number; height: number; cropperCircleOverlay?: boolean}
> = {
  // Feed posts stay square.
  post: {width: 1080, height: 1080},
  // WhatsApp-style avatar crops: square frame + circular guide.
  profile: {width: 640, height: 640, cropperCircleOverlay: true},
  communityCover: {width: 640, height: 640, cropperCircleOverlay: true},
  communityCompose: {width: 1080, height: 1080},
  bugReport: {width: 1080, height: 1920},
};

const AVATAR_SURFACES = new Set<MediaCropSurface>(['profile', 'communityCover']);

const BASE_PICK = {
  mediaType: 'photo' as const,
  compressImageQuality: 0.88,
  includeExif: false,
  cropping: false,
};

const CROPPER_CHROME = {
  cropperToolbarTitle: 'Adjust',
  cropperToolbarColor: '#111111',
  cropperToolbarWidgetColor: '#FFFFFF',
  cropperActiveWidgetColor: '#FFFFFF',
  // Android 0.50.x — keep toolbar contrast if status bar still draws above.
  cropperStatusBarColor: '#111111',
};

function normalizePickedImage(picked: {
  path: string;
  mime?: string;
  filename?: string | null;
}): LocalMediaImage {
  const uri = picked.path;
  const fileName = picked.filename || uri.split('/').pop() || 'image.jpg';
  return {
    uri,
    fileName,
    type: picked.mime || 'image/jpeg',
  };
}

export function isMediaPickerCancelled(error: unknown) {
  const code = (error as {code?: string} | null)?.code;
  return code === 'E_PICKER_CANCELLED' || code === 'E_NO_IMAGE_DATA_FOUND';
}

async function withCropperChrome<T>(run: () => Promise<T>): Promise<T> {
  if (Platform.OS === 'android') {
    StatusBar.setHidden(true, 'fade');
  }
  try {
    return await run();
  } finally {
    if (Platform.OS === 'android') {
      StatusBar.setHidden(false, 'fade');
    }
  }
}

export async function pickPhotos(options: {
  surface: MediaCropSurface;
  multiple?: boolean;
  maxFiles?: number;
}): Promise<LocalMediaImage[]> {
  const picked = await ImagePicker.openPicker({
    ...BASE_PICK,
    multiple: Boolean(options.multiple),
    maxFiles: options.maxFiles || 1,
  });

  const images = Array.isArray(picked) ? picked : [picked];
  const limit = options.multiple ? options.maxFiles || images.length : 1;
  return images.slice(0, limit).map(normalizePickedImage);
}

export async function pickPhoto(surface: MediaCropSurface): Promise<LocalMediaImage | null> {
  const images = await pickPhotos({surface, multiple: false});
  return images[0] || null;
}

/** Library / gallery pick, then immediate WhatsApp-style circular crop for avatars. */
export async function pickAvatarPhoto(
  surface: 'profile' | 'communityCover',
): Promise<LocalMediaImage | null> {
  const picked = await pickPhoto(surface);
  if (!picked) return null;
  return adjustPhoto(picked, surface);
}

export async function adjustPhoto(
  image: {uri: string},
  surface: MediaCropSurface,
): Promise<LocalMediaImage> {
  const crop = SURFACE_CROP[surface];
  const picked = await withCropperChrome(() =>
    ImagePicker.openCropper({
      path: image.uri,
      mediaType: 'photo',
      compressImageQuality: 0.88,
      includeExif: false,
      cropping: true,
      width: crop.width,
      height: crop.height,
      freeStyleCropEnabled: false,
      cropperCircleOverlay: Boolean(crop.cropperCircleOverlay ?? AVATAR_SURFACES.has(surface)),
      ...CROPPER_CHROME,
    }),
  );
  return normalizePickedImage(picked);
}
