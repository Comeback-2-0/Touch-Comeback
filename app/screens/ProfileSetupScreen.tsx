import React, {useState} from 'react';
import ProfileForm from '../features/profile/components/ProfileForm';
import {useProfileImagePicker} from '../features/profile/hooks/useProfileImagePicker';
import {
  useCompleteProfile,
  useUploadProfilePicture,
} from '../features/profile/hooks/useProfileMutations';
import {useCurrentProfile} from '../features/profile/hooks/useCurrentProfile';
import {useAuth} from '../context/AuthContext';
import type {LocalProfileImage, Profile, ProfilePayload} from '../features/profile/types';

function getErrorMessage(error: unknown) {
  if (!error) return undefined;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export default function ProfileSetupScreen() {
  const {user, signOut} = useAuth();
  const {data: currentProfile} = useCurrentProfile();
  const googlePhoto = user?.photo || '';
  const setupProfile: Profile | undefined = currentProfile
    ? {
        ...currentProfile,
        name: currentProfile.name || user?.name || '',
        profilePicture: currentProfile.profilePicture || googlePhoto,
      }
    : googlePhoto
      ? {
          id: user?._id || '',
          name: user?.name || '',
          username: '',
          bio: '',
          profilePicture: googlePhoto,
          isPrivate: false,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          isProfileComplete: false,
        }
      : undefined;
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
      } else if (setupProfile?.profilePicture) {
        nextPayload = {
          ...payload,
          profilePicture: setupProfile.profilePicture,
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
      initialProfile={setupProfile}
      accountEmail={user?.email}
      onSwitchAccount={signOut}
      image={imagePicker.image}
      onPickImage={imagePicker.pickImage}
      onAdjustImage={imagePicker.adjustImage}
      onSubmit={handleSubmit}
      submitting={completeMutation.isPending}
      uploading={uploadMutation.isPending}
      uploadProgress={uploadMutation.progress}
      errorMessage={submitError || getErrorMessage(completeMutation.error || uploadMutation.error)}
    />
  );
}
