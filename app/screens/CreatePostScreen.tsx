import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {pastelColors} from '../theme/colors';
import {useCreatePost} from '../features/posts/hooks/useCreatePost';
import type {LocalPostImage} from '../features/posts/types';
import {adjustPostImage} from '../features/posts/utils/postImagePicker';
import {isMediaPickerCancelled} from '../utils/mediaCrop';

const CAPTION_LIMIT = 2000;

type Props = {
  navigation?: {
    goBack: () => void;
  };
  route?: {
    params?: {
      images?: LocalPostImage[];
    };
  };
};

export default function CreatePostScreen({navigation, route}: Props) {
  const {width: screenWidth} = useWindowDimensions();
  const imageSize = screenWidth;
  const initialImages = useMemo(() => (route?.params?.images || []).slice(0, 10), [
    route?.params?.images,
  ]);
  const [selectedImages, setSelectedImages] = useState(initialImages);
  const [caption, setCaption] = useState('');
  const [localError, setLocalError] = useState('');
  const createMutation = useCreatePost();
  const trimmedCaption = caption.trim();

  const backendError = useMemo(() => {
    const error = createMutation.error as any;
    return error?.response?.data?.error || error?.message || '';
  }, [createMutation.error]);

  const isCaptionOverLimit = caption.length > CAPTION_LIMIT;
  const submitDisabled =
    createMutation.isPending || selectedImages.length === 0 || isCaptionOverLimit;

  const handleAdjustImage = async (index: number) => {
    if (createMutation.isPending) return;

    try {
      const adjustedImage = await adjustPostImage(selectedImages[index]);
      setSelectedImages(current =>
        current.map((item, itemIndex) => (itemIndex === index ? adjustedImage : item)),
      );
    } catch (err: any) {
      if (isMediaPickerCancelled(err)) return;
      setLocalError('Could not adjust that image. Try again.');
    }
  };

  const handleSubmit = async () => {
    if (submitDisabled) return;
    setLocalError('');

    try {
      await createMutation.mutateAsync({
        text: trimmedCaption,
        images: selectedImages,
      });
      navigation?.goBack();
    } catch (err) {
      setLocalError('Could not publish your post. Try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior="padding">
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close create post"
            onPress={() => navigation?.goBack()}
            style={styles.iconButton}>
            <Feather name="x" size={22} color={pastelColors.auth.deepText} />
          </Pressable>
          <Text style={styles.title}>New Post</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.previewScroller}>
            {selectedImages.map((item, index) => (
              <View
                key={`${item.uri}-${index}`}
                testID={`selected-post-image-${index}`}
                style={[styles.previewTile, {width: imageSize, height: imageSize}]}>
                <Image source={{uri: item.uri}} style={styles.previewImage} resizeMode="cover" />
                <Pressable
                  testID={`adjust-post-image-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel="Adjust image"
                  onPress={() => handleAdjustImage(index)}
                  style={styles.adjustButton}>
                  <Feather name="crop" size={17} color={pastelColors.white} />
                  <Text style={styles.adjustLabel}>Adjust</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
            <View style={styles.captionSection}>
              <TextInput
                testID="create-post-caption"
                value={caption}
                onChangeText={setCaption}
                placeholder="Write a caption..."
                placeholderTextColor={pastelColors.auth.mutedText}
                multiline
                scrollEnabled
                textAlignVertical="center"
                editable={!createMutation.isPending}
                style={styles.captionInput}
              />
              {isCaptionOverLimit ? (
                <Text style={styles.counter}>
                  {caption.length}/{CAPTION_LIMIT}
                </Text>
              ) : null}

              {createMutation.isPending ? (
                <View style={styles.progressShell}>
                  <View style={[styles.progressBar, {width: `${createMutation.progress || 8}%`}]} />
                  <Text style={styles.progressText}>
                    Uploading {createMutation.progress || 0}%
                  </Text>
                </View>
              ) : null}

              {localError || backendError ? (
                <Text testID="create-post-error" style={styles.errorText}>
                  {backendError || localError}
                </Text>
              ) : null}
            </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            testID="create-post-submit"
            accessibilityRole="button"
            accessibilityState={{
              busy: createMutation.isPending,
              disabled: submitDisabled,
            }}
            disabled={submitDisabled}
            onPress={handleSubmit}
            style={[styles.submitButton, submitDisabled && styles.submitButtonDisabled]}>
            {createMutation.isPending ? (
              <ActivityIndicator size="small" color={pastelColors.white} />
            ) : (
              <Text style={styles.submitLabel}>Post</Text>
            )}
          </Pressable>
        </View>
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
  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: pastelColors.auth.glassBorder,
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: pastelColors.auth.deepText,
    fontSize: 18,
    fontWeight: '900',
  },
  headerSpacer: {
    width: 42,
    height: 42,
  },
  content: {
    paddingBottom: 24,
  },
  previewScroller: {
    width: '100%',
  },
  previewTile: {
    overflow: 'hidden',
    backgroundColor: pastelColors.auth.deepText,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  adjustButton: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(47, 13, 33, 0.72)',
  },
  adjustLabel: {
    color: pastelColors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  captionSection: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  captionInput: {
    height: 112,
    maxHeight: 112,
    minHeight: 44,
    paddingHorizontal: 0,
    paddingVertical: 8,
    color: pastelColors.auth.deepText,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  counter: {
    marginTop: 4,
    color: pastelColors.error,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
  progressShell: {
    marginTop: 16,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    backgroundColor: pastelColors.card,
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: pastelColors.primary,
  },
  progressText: {
    color: pastelColors.auth.deepText,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '900',
  },
  errorText: {
    marginTop: 16,
    color: pastelColors.error,
    fontWeight: '800',
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: pastelColors.auth.glassBorder,
    backgroundColor: pastelColors.auth.background,
  },
  submitButton: {
    minHeight: 52,
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
