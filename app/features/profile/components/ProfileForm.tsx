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
  accountEmail?: string;
  onSwitchAccount?: () => Promise<void> | void;
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
  accountEmail,
  onSwitchAccount,
  image,
  onPickImage,
  onSubmit,
  submitting,
  uploading = false,
  uploadProgress = 0,
  errorMessage,
}: Props) {
  const [name, setName] = useState(initialProfile?.name || '');
  const [username, setUsername] = useState(initialProfile?.username || '');
  const [bio, setBio] = useState(initialProfile?.bio || '');
  const [isPrivate, setIsPrivate] = useState(initialProfile?.isPrivate || false);
  const normalizedUsername = normalizeUsername(username);
  const usernameState = useUsernameAvailability(username, initialProfile?.username || '');

  const formValid = useMemo(
    () =>
      normalizedUsername.length > 0 &&
      name.trim().length > 0 &&
      usernameState.isValidFormat &&
      usernameState.available &&
      bio.length <= BIO_LIMIT,
    [bio.length, name, normalizedUsername.length, usernameState.available, usernameState.isValidFormat],
  );

  const submitDisabled = !formValid || submitting || uploading || usernameState.isChecking;

  const handleSubmit = async () => {
    if (submitDisabled) return;
    await onSubmit(
      {
        name: name.trim(),
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View testID="profile-field-picture">
            <ProfileAvatarPicker
              image={image}
              fallbackUri={initialProfile?.profilePicture}
              onPick={onPickImage}
              uploading={uploading}
              progress={uploadProgress}
            />
          </View>

          <View testID="profile-field-name" style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              testID="profile-form-name"
              autoCapitalize="words"
              autoCorrect={false}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={pastelColors.auth.mutedText}
              style={styles.input}
            />
          </View>

          <View testID="profile-field-username" style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.usernameInputShell}>
              <TextInput
                testID="profile-form-username"
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={value => setUsername(normalizeUsername(value))}
                placeholder="username"
                placeholderTextColor={pastelColors.auth.mutedText}
                style={styles.usernameInput}
              />
              {usernameState.isChecking ? (
                <ActivityIndicator size="small" color={pastelColors.accent} />
              ) : (
                <Text
                  testID="profile-username-status"
                  numberOfLines={1}
                  style={[
                    styles.usernameStatus,
                    usernameState.available ? styles.successText : styles.errorText,
                  ]}>
                  {usernameState.available ? 'Available' : usernameState.message}
                </Text>
              )}
            </View>
          </View>

          {accountEmail ? (
            <View testID="profile-field-email" style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.emailRow}>
                <Text testID="profile-account-email" numberOfLines={1} style={styles.emailText}>
                  {accountEmail}
                </Text>
                {onSwitchAccount ? (
                  <Pressable
                    testID="profile-switch-google-account"
                    accessibilityRole="button"
                    onPress={onSwitchAccount}
                    style={styles.switchAccountButton}>
                    <Text style={styles.switchAccountLabel}>Change</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : null}

          <View testID="profile-field-bio" style={styles.field}>
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
              placeholder="Optional"
              placeholderTextColor={pastelColors.auth.mutedText}
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.bioInput]}
            />
          </View>

          <View testID="profile-field-private" style={styles.privacyRow}>
            <Text style={[styles.label, styles.privacyLabel]}>Private Account</Text>
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
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 18,
    justifyContent: 'space-between',
  },
  title: {
    color: pastelColors.auth.deepText,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 14,
    color: pastelColors.auth.mutedText,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  field: {
    marginBottom: 10,
  },
  label: {
    color: pastelColors.auth.deepText,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },
  input: {
    height: 48,
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
    height: 78,
    paddingTop: 12,
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
    minHeight: 58,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: pastelColors.white,
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
  },
  privacyLabel: {
    marginBottom: 0,
  },
  usernameInputShell: {
    height: 48,
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pastelColors.white,
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
  },
  usernameInput: {
    flex: 1,
    color: pastelColors.auth.deepText,
    fontSize: 15,
    fontWeight: '700',
    paddingVertical: 0,
  },
  usernameStatus: {
    maxWidth: 122,
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
  },
  emailRow: {
    height: 48,
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7EEF2',
    borderWidth: 1,
    borderColor: '#E6CAD5',
  },
  emailText: {
    flex: 1,
    color: pastelColors.auth.deepText,
    fontSize: 14,
    fontWeight: '800',
  },
  switchAccountButton: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastelColors.white,
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
  },
  switchAccountLabel: {
    color: pastelColors.accent,
    fontSize: 12,
    fontWeight: '900',
  },
  formError: {
    marginTop: 14,
    color: pastelColors.error,
    fontWeight: '800',
  },
  submitButton: {
    minHeight: 54,
    marginTop: 6,
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
