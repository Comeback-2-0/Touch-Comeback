import {useState} from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import type {LocalProfileImage} from '../types';

export function useProfileImagePicker(initialUri = '') {
  const [image, setImage] = useState<LocalProfileImage | null>(
    initialUri ? {uri: initialUri, type: 'image/jpeg', fileName: 'profile.jpg'} : null,
  );

  const pickImage = async () => {
    const picked = await ImagePicker.openPicker({
      width: 512,
      height: 512,
      cropping: true,
      cropperCircleOverlay: false,
      mediaType: 'photo',
      compressImageQuality: 0.88,
      includeExif: false,
    });

    const uri = picked.path;
    const fileName = uri.split('/').pop() || 'profile-picture.jpg';
    setImage({
      uri,
      fileName,
      type: picked.mime || 'image/jpeg',
    });
  };

  return {
    image,
    pickImage,
    clearImage: () => setImage(null),
  };
}
