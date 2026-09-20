import React, {useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {pastelColors} from '../theme/colors';
import type {AppStackParamList} from '../navigation/AppStack';
import ProfileForm from '../features/profile/components/ProfileForm';
import {useCurrentProfile} from '../features/profile/hooks/useCurrentProfile';
import {useProfileImagePicker} from '../features/profile/hooks/useProfileImagePicker';
import {
  useUpdateProfile,
  useUploadProfilePicture,
} from '../features/profile/hooks/useProfileMutations';
import type {LocalProfileImage, ProfilePayload} from '../features/profile/types';

type Navigation = NativeStackNavigationProp<AppStackParamList, 'EditProfile'>;

function getErrorMessage(error: unknown) {
  if (!error) return undefined;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export default function EditProfile() {
  const navigation = useNavigation<Navigation>();
  const {data: profile, isLoading, isError, refetch} = useCurrentProfile();
  const imagePicker = useProfileImagePicker(profile?.profilePicture || '');
  const uploadMutation = useUploadProfilePicture();
  const updateMutation = useUpdateProfile();
  const [submitError, setSubmitError] = useState<string | undefined>();

  const handleSubmit = async (payload: ProfilePayload, image: LocalProfileImage | null) => {
    setSubmitError(undefined);
    try {
      let nextPayload = payload;
      const imageChanged = image?.uri && image.uri !== profile?.profilePicture;
      if (image && imageChanged) {
        const uploaded = await uploadMutation.mutateAsync(image);
        nextPayload = {
          ...payload,
          profilePicture: uploaded.url,
          profilePicturePublicId: uploaded.publicId,
        };
      }
      await updateMutation.mutateAsync(nextPayload);
      navigation.goBack();
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={pastelColors.accent} />
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorTitle}>Could not load profile</Text>
        <Pressable onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryLabel}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={pastelColors.auth.deepText} />
      </Pressable>
      <ProfileForm
        title="Edit Profile"
        subtitle="Update the details people see on Touch."
        submitLabel="Save Changes"
        initialProfile={profile}
        image={imagePicker.image}
        onPickImage={imagePicker.pickImage}
        onAdjustImage={imagePicker.adjustImage}
        onSubmit={handleSubmit}
        submitting={updateMutation.isPending}
        uploading={uploadMutation.isPending}
        uploadProgress={uploadMutation.progress}
        errorMessage={submitError || getErrorMessage(updateMutation.error || uploadMutation.error)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pastelColors.auth.background,
  },
  backButton: {
    position: 'absolute',
    top: 18,
    left: 16,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastelColors.white,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastelColors.auth.background,
  },
  errorTitle: {
    color: pastelColors.auth.deepText,
    fontSize: 18,
    fontWeight: '900',
  },
  retryButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: pastelColors.accent,
  },
  retryLabel: {
    color: pastelColors.white,
    fontWeight: '900',
  },
});
