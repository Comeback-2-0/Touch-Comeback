import {useState} from 'react';
import type {LocalProfileImage} from '../types';
import {
  adjustPhoto,
  isMediaPickerCancelled,
  pickAvatarPhoto,
} from '../../../utils/mediaCrop';

export function useProfileImagePicker(initialUri = '') {
  const [image, setImage] = useState<LocalProfileImage | null>(
    initialUri ? {uri: initialUri, type: 'image/jpeg', fileName: 'profile.jpg'} : null,
  );

  const pickImage = async () => {
    try {
      const picked = await pickAvatarPhoto('profile');
      if (picked) setImage(picked);
    } catch (error) {
      if (!isMediaPickerCancelled(error)) throw error;
    }
  };

  const adjustImage = async () => {
    if (!image?.uri) return;
    try {
      const adjusted = await adjustPhoto(image, 'profile');
      setImage(adjusted);
    } catch (error) {
      if (!isMediaPickerCancelled(error)) throw error;
    }
  };

  return {
    image,
    pickImage,
    adjustImage,
    clearImage: () => setImage(null),
  };
}
