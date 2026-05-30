import React, {useState} from 'react';
import {
  ActivityIndicator,
  Image,
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
import ImagePicker from 'react-native-image-crop-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {submitBugReport} from '../utils/api';
import {pastelColors} from '../theme/colors';

type Screenshot = {
  uri: string;
  fileName?: string;
  type?: string;
} | null;

export default function ReportBugScreen() {
  const navigation = useNavigation();
  const [whatHappened, setWhatHappened] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [screenshot, setScreenshot] = useState<Screenshot>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = whatHappened.trim().length > 0 && stepsToReproduce.trim().length > 0 && !isSubmitting;

  const pickScreenshot = async () => {
    try {
      const image = await ImagePicker.openPicker({mediaType: 'photo'});
      setScreenshot({
        uri: image.path,
        fileName: image.filename || 'bug-screenshot.jpg',
        type: image.mime || 'image/jpeg',
      });
      setError('');
    } catch (err: any) {
      if (err?.code !== 'E_PICKER_CANCELLED') {
        setError('Could not attach screenshot');
      }
    }
  };

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError('');

    try {
      await submitBugReport({
        whatHappened: whatHappened.trim(),
        stepsToReproduce: stepsToReproduce.trim(),
        screenshot,
      });
      ToastAndroid.show('Bug report submitted', ToastAndroid.SHORT);
      navigation.goBack();
    } catch (err) {
      setError('Could not send bug report. Please try again.');
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
        <Text style={styles.title}>Report a Bug</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Text style={styles.label}>What happened?</Text>
          <TextInput
            testID="bug-what-happened"
            value={whatHappened}
            onChangeText={setWhatHappened}
            placeholder="Tell us what broke"
            placeholderTextColor="#A98C98"
            multiline
            style={[styles.input, styles.shortTextArea]}
          />

          <Text style={styles.label}>Steps to reproduce</Text>
          <TextInput
            testID="bug-steps-to-reproduce"
            value={stepsToReproduce}
            onChangeText={setStepsToReproduce}
            placeholder="List the taps or screen path"
            placeholderTextColor="#A98C98"
            multiline
            style={styles.input}
          />

          <Text style={styles.label}>Optional Screenshot</Text>
          <Pressable
            testID="bug-screenshot-picker"
            accessibilityRole="button"
            onPress={pickScreenshot}
            style={styles.screenshotButton}>
            <Ionicons name="image-outline" size={19} color={pastelColors.accent} />
            <Text style={styles.screenshotLabel}>
              {screenshot ? 'Change screenshot' : 'Upload screenshot'}
            </Text>
          </Pressable>

          {screenshot ? (
            <Image source={{uri: screenshot.uri}} style={styles.screenshotPreview} />
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            testID="bug-submit"
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
    fontSize: 24,
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
    minHeight: 128,
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
  shortTextArea: {
    minHeight: 92,
  },
  screenshotButton: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
    backgroundColor: pastelColors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  screenshotLabel: {
    marginLeft: 10,
    color: pastelColors.auth.deepText,
    fontSize: 15,
    fontWeight: '800',
  },
  screenshotPreview: {
    width: 104,
    height: 104,
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: pastelColors.card,
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
