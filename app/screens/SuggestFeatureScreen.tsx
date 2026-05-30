import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {submitFeatureRequest} from '../utils/api';
import {pastelColors} from '../theme/colors';

export default function SuggestFeatureScreen() {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && !isSubmitting;

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError('');

    try {
      await submitFeatureRequest({
        title: title.trim(),
        description: description.trim(),
      });
      ToastAndroid.show('Feature request submitted', ToastAndroid.SHORT);
      navigation.goBack();
    } catch (err) {
      setError('Could not send feature request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={pastelColors.auth.deepText} />
        </Pressable>
        <Text style={styles.title}>Suggest a Feature</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Text style={styles.label}>Feature Title</Text>
          <TextInput
            testID="feature-title"
            value={title}
            onChangeText={setTitle}
            placeholder="Community Polls"
            placeholderTextColor="#A98C98"
            style={styles.input}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            testID="feature-description"
            value={description}
            onChangeText={setDescription}
            placeholder="Allow community owners to create polls."
            placeholderTextColor="#A98C98"
            multiline
            style={styles.textArea}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            testID="feature-submit"
            accessibilityRole="button"
            disabled={!canSubmit}
            onPress={submit}
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}>
            {isSubmitting ? (
              <ActivityIndicator color={pastelColors.white} />
            ) : (
              <Text style={styles.submitLabel}>Submit</Text>
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
  keyboardView: {
    flex: 1,
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: pastelColors.auth.glassBorder,
    backgroundColor: pastelColors.auth.background,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastelColors.white,
  },
  headerSpacer: {
    width: 42,
  },
  title: {
    color: pastelColors.auth.deepText,
    fontSize: 22,
    fontWeight: '900',
  },
  content: {
    padding: 18,
    paddingBottom: 32,
  },
  label: {
    marginTop: 14,
    marginBottom: 8,
    color: pastelColors.auth.deepText,
    fontSize: 14,
    fontWeight: '900',
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
    backgroundColor: pastelColors.white,
    color: pastelColors.auth.deepText,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '700',
  },
  textArea: {
    minHeight: 150,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
    backgroundColor: pastelColors.white,
    color: pastelColors.auth.deepText,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
    fontSize: 15,
    fontWeight: '600',
  },
  error: {
    marginTop: 14,
    color: '#B42318',
    fontSize: 13,
    fontWeight: '800',
  },
  submitButton: {
    minHeight: 54,
    marginTop: 22,
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
    fontSize: 16,
    fontWeight: '900',
  },
});
