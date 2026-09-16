import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {launchImageLibrary} from 'react-native-image-picker';
import Video from 'react-native-video';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {api} from '../../utils/api';
import {pastelColors} from '../../theme/colors';
import type {CommunityStackParamList} from '../../navigation/CommunityStack';

type Route = RouteProp<CommunityStackParamList, 'CommunityCompose'>;
type Navigation = NativeStackNavigationProp<CommunityStackParamList>;

const PREVIEW = Math.min(Dimensions.get('window').width - 32, 420);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_SECONDS = 30;

export default function CommunityComposeScreen() {
  const navigation = useNavigation<Navigation>();
  const {
    params: {community},
  } = useRoute<Route>();
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [media, setMedia] = useState<any>(null);
  const [sending, setSending] = useState(false);

  const pickMedia = async () => {
    const result = await launchImageLibrary({
      mediaType: 'mixed',
      selectionLimit: 1,
      videoQuality: 'medium',
    });
    const asset = result.assets?.[0];
    if (!asset) return;
    const isPickedVideo = Boolean(asset.type?.startsWith('video') || asset.duration);
    if (isPickedVideo && Number(asset.duration || 0) > MAX_VIDEO_SECONDS) {
      Alert.alert('Clip is too long', 'Videos and clips must be 30 seconds or shorter.');
      return;
    }
    if (isPickedVideo && Number(asset.fileSize || 0) > MAX_VIDEO_BYTES) {
      Alert.alert('Clip is too large', 'Videos and clips must be 25 MB or smaller.');
      return;
    }
    if (!isPickedVideo && Number(asset.fileSize || 0) > MAX_IMAGE_BYTES) {
      Alert.alert('Image is too large', 'Images, memes, and stickers must be 5 MB or smaller.');
      return;
    }
    setMedia(asset);
  };

  const submit = async () => {
    if (!text.trim() && !media) return;
    setSending(true);
    try {
      const form = new FormData();
      form.append('text', text);
      form.append('link', link);
      if (media) {
        form.append('media', {
          uri: media.uri,
          type: media.type || 'image/jpeg',
          name: media.fileName || 'community-media',
        } as any);
      }
      await api.post(`/communities/${community.id || community._id}/content/queue`, form, {
        headers: {'Content-Type': 'multipart/form-data'},
      });
      Alert.alert('Sent to review', 'Your post is now in the community review queue.');
      navigation.goBack();
    } catch {
      Alert.alert('Could not submit', 'Please try again.');
    } finally {
      setSending(false);
    }
  };

  const isVideo = Boolean(media?.type?.startsWith('video') || media?.duration);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Close composer">
          <Feather name="x" size={24} color={pastelColors.auth.deepText} />
        </Pressable>
        <Text style={styles.title}>Anonymous post</Text>
        <Pressable
          onPress={submit}
          disabled={sending || (!text.trim() && !media)}
          accessibilityRole="button">
          <Text
            style={[
              styles.submit,
              (sending || (!text.trim() && !media)) && styles.disabled,
            ]}>
            Send
          </Text>
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.note}>
          Posts first go to {community.name}'s review queue.
        </Text>

        {media ? (
          <View style={[styles.previewTile, {width: PREVIEW, height: PREVIEW}]}>
            {isVideo ? (
              <Video
                source={{uri: media.uri}}
                style={styles.previewMedia}
                resizeMode="contain"
                paused
                controls
              />
            ) : (
              <Image source={{uri: media.uri}} style={styles.previewMedia} resizeMode="contain" />
            )}
            <Pressable onPress={() => setMedia(null)} style={styles.removeChip}>
              <Feather name="x" size={16} color={pastelColors.white} />
              <Text style={styles.removeLabel}>Remove</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={pickMedia}
            style={[styles.add, {width: PREVIEW, height: PREVIEW}]}
            accessibilityRole="button"
            accessibilityLabel="Add one image, sticker, meme, or video">
            <Feather name="image" size={28} color={pastelColors.accent} />
            <Text style={styles.addText}>Add meme / image / clip</Text>
            <Text style={styles.addHint}>1 item · Images 5 MB · Clips 30s / 25 MB</Text>
          </Pressable>
        )}

        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          placeholder={media ? 'Write a caption...' : 'Say what you cannot say elsewhere...'}
          placeholderTextColor={pastelColors.auth.mutedText}
          style={[styles.text, !media && styles.textOnly]}
        />

        <TextInput
          value={link}
          onChangeText={setLink}
          placeholder="Optional link"
          placeholderTextColor={pastelColors.auth.mutedText}
          autoCapitalize="none"
          style={styles.link}
        />

        {sending ? <ActivityIndicator style={styles.loading} color={pastelColors.accent} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: pastelColors.auth.background},
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {fontSize: 18, fontWeight: '900', color: pastelColors.auth.deepText},
  submit: {fontWeight: '900', color: pastelColors.accent},
  disabled: {opacity: 0.4},
  content: {paddingHorizontal: 16, paddingBottom: 32},
  note: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: pastelColors.auth.glassSurface,
    color: pastelColors.auth.mutedText,
    fontWeight: '700',
    marginBottom: 16,
  },
  previewTile: {
    alignSelf: 'center',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: pastelColors.auth.primaryOverlay,
  },
  previewMedia: {width: '100%', height: '100%'},
  removeChip: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(50,17,31,0.72)',
  },
  removeLabel: {color: pastelColors.white, fontWeight: '800', fontSize: 12},
  add: {
    alignSelf: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: pastelColors.accent,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: pastelColors.auth.glassSurface,
  },
  addText: {fontWeight: '800', color: pastelColors.accent},
  addHint: {color: pastelColors.auth.mutedText, fontWeight: '600', fontSize: 12},
  text: {
    marginTop: 16,
    minHeight: 88,
    padding: 14,
    borderRadius: 16,
    backgroundColor: pastelColors.white,
    color: pastelColors.auth.deepText,
    fontSize: 17,
    textAlignVertical: 'top',
  },
  textOnly: {minHeight: 160, fontSize: 18, lineHeight: 26, fontWeight: '600'},
  link: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: pastelColors.white,
    color: pastelColors.auth.deepText,
  },
  loading: {marginTop: 16},
});
