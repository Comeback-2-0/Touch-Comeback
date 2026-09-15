import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import Video from 'react-native-video';
import {pastelColors} from '../../theme/colors';

type Media = {
  type?: string;
  url?: string;
  mimeType?: string;
  uri?: string;
};

type Props = {
  media?: Media | null;
  caption?: string;
  alias?: string;
  link?: string;
  compact?: boolean;
};

function isVideo(media?: Media | null) {
  if (!media) return false;
  if (media.type === 'video') return true;
  const mime = media.mimeType || '';
  return mime.startsWith('video/');
}

export default function CommunityPostCard({
  media,
  caption = '',
  alias,
  link,
  compact = false,
}: Props) {
  const uri = media?.url || media?.uri;
  const hasMedia = Boolean(uri);
  const hasText = Boolean(caption.trim());

  if (!hasMedia && !hasText) return null;

  return (
    <View style={[styles.card, compact && styles.compact]}>
      {alias ? <Text style={styles.alias}>{alias}</Text> : null}
      {hasMedia ? (
        <View style={styles.mediaFrame}>
          {isVideo(media) ? (
            <Video
              source={{uri}}
              style={styles.media}
              resizeMode="cover"
              muted
              repeat
              paused={false}
              controls={false}
            />
          ) : (
            <Image source={{uri}} style={styles.media} resizeMode="cover" />
          )}
        </View>
      ) : null}
      {hasText ? (
        <Text style={[styles.caption, !hasMedia && styles.textOnly]}>{caption.trim()}</Text>
      ) : null}
      {link ? <Text style={styles.link}>{link}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: pastelColors.auth.glassSurface,
  },
  compact: {backgroundColor: 'transparent'},
  alias: {
    paddingHorizontal: 14,
    paddingTop: 12,
    fontWeight: '900',
    color: pastelColors.accent,
  },
  mediaFrame: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: pastelColors.auth.primaryOverlay,
    marginTop: 8,
  },
  media: {width: '100%', height: '100%'},
  caption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 22,
    color: pastelColors.auth.deepText,
    fontWeight: '600',
  },
  textOnly: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
    paddingTop: 16,
  },
  link: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    color: pastelColors.accent,
    fontWeight: '700',
  },
});
