import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {pastelColors} from '../../../theme/colors';
import type {LocalProfileImage, Profile, ProfilePayload} from '../types';
import ProfileAvatarPicker from './ProfileAvatarPicker';
import {normalizeUsername, useUsernameAvailability} from '../hooks/useUsernameAvailability';

const BIO_LIMIT = 150;

type Props = {
  title: string;
  subtitle: string;
  submitLabel: string;
  initialProfile?: Profile;
  image: LocalProfileImage | null;
  onPickImage: () => void;
  onSubmit: (payload: ProfilePayload, image: LocalProfileImage | null) => Promise<void>;
  submitting: boolean;
  uploading?: boolean;
  uploadProgress?: number;
  errorMessage?: string;
};

export default function ProfileForm({
  title,
  subtitle,
  submitLabel,
  initialProfile,
  image,
  onPickImage,
  onSubmit,
  submitting,
  uploading = false,
  uploadProgress = 0,
  errorMessage,
}: Props) {
  const [username, setUsername] = useState(initialProfile?.username || '');
  const [bio, setBio] = useState(initialProfile?.bio || '');
  const [isPrivate, setIsPrivate] = useState(initialProfile?.isPrivate || false);
  const normalizedUsername = normalizeUsername(username);
  const usernameState = useUsernameAvailability(username, initialProfile?.username || '');

  const formValid = useMemo(
    () =>
      normalizedUsername.length > 0 &&
      usernameState.isValidFormat &&
      usernameState.available &&
      bio.length <= BIO_LIMIT,
    [bio.length, normalizedUsername.length, usernameState.available, usernameState.isValidFormat],
  );

  const submitDisabled = !formValid || submitting || uploading || usernameState.isChecking;

  const handleSubmit = async () => {
    if (submitDisabled) return;
    await onSubmit(
      {
        username: normalizedUsername,
        bio,
        isPrivate,
      },
      image,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <ProfileAvatarPicker
            image={image}
            fallbackUri={initialProfile?.profilePicture}
            onPick={onPickImage}
            uploading={uploading}
            progress={uploadProgress}
          />

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              testID="profile-form-username"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={value => setUsername(normalizeUsername(value))}
              placeholder="username"
              placeholderTextColor={pastelColors.auth.mutedText}
              style={styles.input}
            />
            <View style={styles.statusRow}>
              {usernameState.isChecking ? (
                <ActivityIndicator size="small" color={pastelColors.accent} />
              ) : null}
              <Text
                style={[
                  styles.helper,
                  usernameState.available ? styles.successText : styles.errorText,
                ]}>
                {usernameState.message}
              </Text>
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Bio</Text>
              <Text style={styles.counter}>
                {bio.length}/{BIO_LIMIT}
              </Text>
            </View>
            <TextInput
              testID="profile-form-bio"
              value={bio}
              onChangeText={value => setBio(value.slice(0, BIO_LIMIT))}
              placeholder="Tell people what kind of energy you bring."
              placeholderTextColor={pastelColors.auth.mutedText}
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.bioInput]}
            />
          </View>

          <View style={styles.privacyRow}>
            <View>
              <Text style={styles.label}>Private Account</Text>
              <Text style={styles.helper}>Approve who can follow you.</Text>
            </View>
            <Switch
              testID="profile-form-private"
              value={isPrivate}
              onValueChange={setIsPrivate}
              thumbColor={isPrivate ? pastelColors.accent : pastelColors.white}
              trackColor={{false: '#E8DDE2', true: pastelColors.primary}}
            />
          </View>

          {errorMessage ? <Text style={styles.formError}>{errorMessage}</Text> : null}

          <Pressable
            testID="profile-submit-button"
            accessibilityRole="button"
            accessibilityState={{busy: submitting || uploading, disabled: submitDisabled}}
            disabled={submitDisabled}
            onPress={handleSubmit}
            style={[styles.submitButton, submitDisabled && styles.submitButtonDisabled]}>
            {submitting || uploading ? (
              <ActivityIndicator color={pastelColors.white} />
            ) : (
              <Text testID="profile-submit-label" style={styles.submitLabel}>
                {submitLabel}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: pastelColors.auth.background,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 34,
  },
  title: {
    color: pastelColors.auth.deepText,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 28,
    color: pastelColors.auth.mutedText,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  field: {
    marginBottom: 18,
  },
  label: {
    color: pastelColors.auth.deepText,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    color: pastelColors.auth.deepText,
    backgroundColor: pastelColors.white,
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
    fontSize: 15,
    fontWeight: '700',
  },
  bioInput: {
    minHeight: 104,
    paddingTop: 14,
  },
  statusRow: {
    minHeight: 22,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helper: {
    color: pastelColors.auth.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  successText: {
    color: pastelColors.success,
  },
  errorText: {
    color: pastelColors.error,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counter: {
    color: pastelColors.auth.mutedText,
    fontSize: 12,
    fontWeight: '800',
  },
  privacyRow: {
    minHeight: 72,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: pastelColors.white,
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
  },
  formError: {
    marginTop: 14,
    color: pastelColors.error,
    fontWeight: '800',
  },
  submitButton: {
    minHeight: 54,
    marginTop: 24,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastelColors.accent,
  },
  submitButtonDisabled: {
    opacity: 0.45,
  },
  submitLabel: {
    color: pastelColors.white,
    fontSize: 15,
    fontWeight: '900',
  },
});
