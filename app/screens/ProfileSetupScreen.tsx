import React, {useState} from 'react';
import ProfileForm from '../features/profile/components/ProfileForm';
import {useProfileImagePicker} from '../features/profile/hooks/useProfileImagePicker';
import {
  useCompleteProfile,
  useUploadProfilePicture,
} from '../features/profile/hooks/useProfileMutations';
import type {LocalProfileImage, ProfilePayload} from '../features/profile/types';

function getErrorMessage(error: unknown) {
  if (!error) return undefined;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export default function ProfileSetupScreen() {
  const imagePicker = useProfileImagePicker();
  const uploadMutation = useUploadProfilePicture();
  const completeMutation = useCompleteProfile();
  const [submitError, setSubmitError] = useState<string | undefined>();

  const handleSubmit = async (payload: ProfilePayload, image: LocalProfileImage | null) => {
    setSubmitError(undefined);
    try {
      let nextPayload = payload;
      if (image) {
        const uploaded = await uploadMutation.mutateAsync(image);
        nextPayload = {
          ...payload,
          profilePicture: uploaded.url,
          profilePicturePublicId: uploaded.publicId,
        };
      }
      await completeMutation.mutateAsync(nextPayload);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    }
  };

  return (
    <ProfileForm
      title="Create your profile"
      subtitle="Set your Touch identity before entering the app."
      submitLabel="Continue"
      image={imagePicker.image}
      onPickImage={imagePicker.pickImage}
      onSubmit={handleSubmit}
      submitting={completeMutation.isPending}
      uploading={uploadMutation.isPending}
      uploadProgress={uploadMutation.progress}
      errorMessage={submitError || getErrorMessage(completeMutation.error || uploadMutation.error)}
    />
  );
}
