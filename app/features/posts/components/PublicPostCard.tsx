import React, {memo, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {pastelColors} from '../../../theme/colors';
import type {PublicPost} from '../types';
import CommentIcon from '../../../../assets/icons/comment.svg';
import LikeIcon from '../../../../assets/icons/like.svg';
import ShareIcon from '../../../../assets/icons/share.svg';
import {likePost, unlikePost} from '../api/postsApi';

type Props = {
  post: PublicPost;
  compact?: boolean;
};

function formatCount(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 100000 ? 0 : 1)}k`;
  return String(value);
}

function PublicPostCard({post, compact = false}: Props) {
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [metaIndex, setMetaIndex] = useState(0);
  const [liked, setLiked] = useState(Boolean(post.viewerEngagement?.liked));
  const [likesCount, setLikesCount] = useState(post.engagement.likesCount || 0);
  const [likeMutationPending, setLikeMutationPending] = useState(false);
  const metaOpacity = useRef(new Animated.Value(1)).current;
  const likeBurstOpacity = useRef(new Animated.Value(0)).current;
  const likeBurstScale = useRef(new Animated.Value(0.65)).current;
  const likeMutationPendingRef = useRef(false);
  const lastMediaTapAt = useRef(0);
  const {width: screenWidth} = useWindowDimensions();
  const images = post.media.filter(item => item.type === 'image');
  const shouldCollapseCaption = post.text.length > 90 && !captionExpanded;
  const caption = shouldCollapseCaption ? `${post.text.slice(0, 90).trim()}...` : post.text;
  const imageSize = compact ? 280 : screenWidth;
  const username = post.author.username || post.author.name || 'touch_user';
  const metaItems = useMemo(() => [dayjs(post.createdAt).format('MMM D, YYYY')], [post.createdAt]);

  useEffect(() => {
    setLiked(Boolean(post.viewerEngagement?.liked));
    setLikesCount(post.engagement.likesCount || 0);
  }, [post.engagement.likesCount, post.id, post.viewerEngagement?.liked]);

  useEffect(() => {
    if (metaItems.length < 2) return undefined;

    const timer = setInterval(() => {
      Animated.timing(metaOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        setMetaIndex(current => (current + 1) % metaItems.length);
        Animated.timing(metaOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }).start();
      });
    }, 2600);

    return () => clearInterval(timer);
  }, [metaItems.length, metaOpacity]);

  function playLikeBurst() {
    likeBurstOpacity.stopAnimation();
    likeBurstScale.stopAnimation();
    likeBurstOpacity.setValue(0);
    likeBurstScale.setValue(0.65);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(likeBurstOpacity, {
          toValue: 1,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.timing(likeBurstScale, {
          toValue: 1.15,
          duration: 120,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(likeBurstScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.delay(170),
      Animated.timing(likeBurstOpacity, {
        toValue: 0,
        duration: 170,
        useNativeDriver: true,
      }),
    ]).start();
  }

  async function setLikedOnServer(nextLiked: boolean) {
    if (likeMutationPendingRef.current || liked === nextLiked) return;

    const previousLiked = liked;
    const previousCount = likesCount;
    const optimisticCount = nextLiked
      ? likesCount + 1
      : Math.max(0, likesCount - 1);

    setLiked(nextLiked);
    setLikesCount(optimisticCount);
    likeMutationPendingRef.current = true;
    setLikeMutationPending(true);

    try {
      const response = nextLiked ? await likePost(post.id) : await unlikePost(post.id);
      setLiked(response.liked);
      setLikesCount(Math.max(0, response.likesCount));
    } catch (err) {
      setLiked(previousLiked);
      setLikesCount(previousCount);
    } finally {
      likeMutationPendingRef.current = false;
      setLikeMutationPending(false);
    }
  }

  async function handleMediaPress() {
    const now = Date.now();
    const isDoubleTap = now - lastMediaTapAt.current < 280;
    lastMediaTapAt.current = isDoubleTap ? 0 : now;

    if (!isDoubleTap) return;

    playLikeBurst();
    if (!liked) {
      await setLikedOnServer(true);
    }
  }

  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.authorRow}>
        <View style={styles.authorText}>
          <Text numberOfLines={1} style={styles.name}>
            {username}
          </Text>
          <Animated.Text numberOfLines={1} style={[styles.meta, {opacity: metaOpacity}]}>
            {metaItems[metaIndex]}
          </Animated.Text>
        </View>

        {post.author.profilePicture ? (
          <Image source={{uri: post.author.profilePicture}} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.emptyAvatar]}>
            <Ionicons name="person" size={16} color={pastelColors.accent} />
          </View>
        )}

        {!compact ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open post options"
            hitSlop={10}
            style={styles.optionsButton}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={18}
              color={pastelColors.auth.deepText}
            />
          </Pressable>
        ) : null}
      </View>

      {images.length ? (
        <View style={styles.mediaShell}>
          <FlatList
            data={images}
            keyExtractor={item => item.publicId || item.url}
            horizontal
            pagingEnabled={!compact}
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => (
              <Pressable
                accessibilityRole="imagebutton"
                accessibilityLabel="Post image"
                testID="post-media-touch-target"
                onPress={handleMediaPress}>
                <Image
                  source={{uri: item.url}}
                  resizeMode="cover"
                  style={[
                    styles.postImage,
                    compact && styles.compactPostImage,
                    {width: imageSize},
                  ]}
                />
              </Pressable>
            )}
            style={styles.mediaList}
            removeClippedSubviews={false}
          />
          <Animated.View
            pointerEvents="none"
            testID="post-like-burst"
            style={[
              styles.likeBurst,
              {
                opacity: likeBurstOpacity,
                transform: [{scale: likeBurstScale}],
              },
            ]}>
            <Ionicons
              name="heart"
              size={82}
              color={pastelColors.accent}
              testID="post-like-burst-icon"
            />
          </Animated.View>
        </View>
      ) : null}

      {!compact ? (
        <View style={styles.actionRow}>
          <View style={styles.commentAction}>
            <CommentIcon width={24} height={22} />
            <Text style={styles.actionCount}>{formatCount(post.engagement.commentsCount)}</Text>
          </View>
          <View style={styles.rightActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={liked ? 'Unlike post' : 'Like post'}
              disabled={likeMutationPending}
              hitSlop={8}
              onPress={() => setLikedOnServer(!liked)}
              style={[styles.metricAction, likeMutationPending && styles.pendingAction]}>
              {liked ? (
                <Ionicons
                  name="heart"
                  size={24}
                  color={pastelColors.accent}
                  testID="post-liked-icon"
                />
              ) : (
                <LikeIcon width={24} height={24} testID="post-unliked-icon" />
              )}
              <Text style={styles.actionCount}>{formatCount(likesCount)}</Text>
            </Pressable>
            <View style={styles.metricAction}>
              <ShareIcon width={24} height={24} />
              <Text style={styles.actionCount}>{formatCount(post.engagement.sharesCount)}</Text>
            </View>
          </View>
        </View>
      ) : null}

      {post.text ? (
        <View style={styles.captionBlock}>
          <Text style={styles.text}>
            <Text style={styles.captionUsername}>{username} </Text>
            {caption}
          </Text>
          {post.text.length > 90 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setCaptionExpanded(value => !value)}
              style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>
                {captionExpanded ? 'View less' : 'View more'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {compact ? (
        <View style={styles.engagementRow}>
          <Text style={styles.engagement}>Likes {likesCount}</Text>
          <Text style={styles.engagement}>Comments {post.engagement.commentsCount}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    paddingTop: 6,
  },
  compactCard: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 18,
    backgroundColor: pastelColors.white,
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
  },
  authorRow: {
    minHeight: 30,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: pastelColors.card,
  },
  emptyAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorText: {
    flex: 1,
    paddingRight: 8,
  },
  name: {
    color: pastelColors.auth.deepText,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '900',
  },
  meta: {
    marginTop: 1,
    color: pastelColors.auth.mutedText,
    fontSize: 8,
    lineHeight: 9,
    fontWeight: '700',
    includeFontPadding: false,
  },
  optionsButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  mediaList: {
    marginTop: 4,
  },
  mediaShell: {
    position: 'relative',
  },
  postImage: {
    aspectRatio: 1,
    backgroundColor: pastelColors.card,
  },
  likeBurst: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactPostImage: {
    borderRadius: 14,
  },
  actionRow: {
    minHeight: 30,
    paddingHorizontal: 16,
    paddingTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metricAction: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 0,
  },
  pendingAction: {
    opacity: 0.55,
  },
  actionCount: {
    color: pastelColors.auth.deepText,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 9,
    includeFontPadding: false,
  },
  text: {
    color: pastelColors.auth.deepText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  captionUsername: {
    fontWeight: '900',
  },
  captionBlock: {
    marginTop: 4,
    paddingHorizontal: 16,
  },
  viewMoreButton: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  viewMoreText: {
    color: pastelColors.auth.mutedText,
    fontSize: 12,
    fontWeight: '900',
  },
  engagementRow: {
    marginTop: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 16,
  },
  engagement: {
    color: pastelColors.auth.mutedText,
    fontSize: 12,
    fontWeight: '800',
  },
});

export default memo(PublicPostCard);
