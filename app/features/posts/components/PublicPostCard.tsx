import React, {memo, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  useWindowDimensions,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {pastelColors} from '../../../theme/colors';
import {useKeyboardHeight} from '../../../screens/community/communityKeyboard';
import type {PostReportReason, PublicPost} from '../types';
import CommentIcon from '../../../../assets/icons/comment.svg';
import LikeIcon from '../../../../assets/icons/like.svg';
import ShareIcon from '../../../../assets/icons/share.svg';
import {
  likePost,
  markPostNotInterested,
  reportPost,
  undoPostNotInterested,
  unlikePost,
  withdrawPostReport,
} from '../api/postsApi';
import {commentOnPost} from '../../../utils/api';

type Props = {
  post: PublicPost;
  compact?: boolean;
  onCommentPress?: () => void;
};

type PlaceholderState = {
  type: 'hidden' | 'reported';
  undoPending?: boolean;
};

const REPORT_REASONS: Array<{value: PostReportReason; label: string}> = [
  {value: 'spam', label: 'Spam'},
  {value: 'harassment', label: 'Harassment or bullying'},
  {value: 'hate', label: 'Hate speech'},
  {value: 'sexual_content', label: 'Sexual content'},
  {value: 'violence', label: 'Violence or threat'},
  {value: 'scam', label: 'Scam or fraud'},
  {value: 'misleading', label: 'False or misleading'},
  {value: 'other', label: 'Other'},
];

const OPTIONS_MENU_WIDTH = 164;
const OPTIONS_MENU_HEIGHT = 89;
const OPTIONS_MENU_EDGE_GAP = 8;
const OPTIONS_MENU_OFFSET = 6;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatCount(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 100000 ? 0 : 1)}k`;
  return String(value);
}

function PublicPostCard({post, compact = false, onCommentPress}: Props) {
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [metaIndex, setMetaIndex] = useState(0);
  const [liked, setLiked] = useState(Boolean(post.viewerEngagement?.liked));
  const [likesCount, setLikesCount] = useState(post.engagement.likesCount || 0);
  const [likeMutationPending, setLikeMutationPending] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentSending, setCommentSending] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [optionsMenuPosition, setOptionsMenuPosition] = useState<{top: number; left: number} | null>(null);
  const [placeholder, setPlaceholder] = useState<PlaceholderState | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<PostReportReason | null>(null);
  const [reportDetails, setReportDetails] = useState('');
  const [reportPending, setReportPending] = useState(false);
  const metaOpacity = useRef(new Animated.Value(1)).current;
  const likeBurstOpacity = useRef(new Animated.Value(0)).current;
  const likeBurstScale = useRef(new Animated.Value(0.65)).current;
  const likeMutationPendingRef = useRef(false);
  const lastMediaTapAt = useRef(0);
  const optionsButtonRef = useRef<View | null>(null);
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const keyboardHeight = useKeyboardHeight();
  const images = post.media.filter(item => item.type === 'image');
  const shouldCollapseCaption = post.text.length > 90 && !captionExpanded;
  const caption = shouldCollapseCaption ? `${post.text.slice(0, 90).trim()}...` : post.text;
  const imageSize = compact ? 280 : screenWidth;
  const username = post.author.username || post.author.name || 'touch_user';
  const metaItems = useMemo(() => [dayjs(post.createdAt).format('MMM D, YYYY')], [post.createdAt]);
  const fallbackOptionsMenuPosition = useMemo(
    () => ({
      top: 58,
      left: Math.max(OPTIONS_MENU_EDGE_GAP, screenWidth - OPTIONS_MENU_WIDTH - 12),
    }),
    [screenWidth],
  );

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

  function showToast(message: string) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
      return;
    }

    Alert.alert('Touch', message);
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

  function openOptionsMenu() {
    const button = optionsButtonRef.current;

    setOptionsMenuPosition(fallbackOptionsMenuPosition);
    setOptionsVisible(true);

    if (!button || typeof button.measureInWindow !== 'function') {
      return;
    }

    button.measureInWindow((x, y, width, height) => {
      const maxLeft = Math.max(OPTIONS_MENU_EDGE_GAP, screenWidth - OPTIONS_MENU_WIDTH - OPTIONS_MENU_EDGE_GAP);
      const left = clamp(
        x + width - OPTIONS_MENU_WIDTH,
        OPTIONS_MENU_EDGE_GAP,
        maxLeft,
      );
      const belowTop = y + height + OPTIONS_MENU_OFFSET;
      const aboveTop = y - OPTIONS_MENU_HEIGHT - OPTIONS_MENU_OFFSET;
      const top =
        belowTop + OPTIONS_MENU_HEIGHT <= screenHeight - OPTIONS_MENU_EDGE_GAP
          ? belowTop
          : Math.max(OPTIONS_MENU_EDGE_GAP, aboveTop);

      setOptionsMenuPosition({top, left});
      setOptionsVisible(true);
    });
  }

  async function handleNotInterested() {
    setOptionsVisible(false);
    setPlaceholder({type: 'hidden'});

    try {
      await markPostNotInterested(post.id);
    } catch (err) {
      setPlaceholder(null);
      showToast('Could not hide post. Please try again.');
    }
  }

  function openReportModal() {
    setOptionsVisible(false);
    setSelectedReportReason(null);
    setReportDetails('');
    setReportModalVisible(true);
  }

  async function submitReport() {
    if (!selectedReportReason || reportPending) return;

    setReportPending(true);

    try {
      await reportPost(post.id, {
        reason: selectedReportReason,
        details: reportDetails.trim(),
      });
      setReportModalVisible(false);
      setPlaceholder({type: 'reported'});
    } catch (err) {
      showToast('Could not send report. Please try again.');
    } finally {
      setReportPending(false);
    }
  }

  async function undoPlaceholder() {
    if (!placeholder || placeholder.undoPending) return;

    setPlaceholder({...placeholder, undoPending: true});

    try {
      if (placeholder.type === 'reported') {
        await withdrawPostReport(post.id);
      } else {
        await undoPostNotInterested(post.id);
      }
      setPlaceholder(null);
    } catch (err) {
      setPlaceholder({
        ...placeholder,
        undoPending: false,
      });
      showToast('Could not undo. Please try again.');
    }
  }

  if (placeholder) {
    const isReported = placeholder.type === 'reported';

    return (
      <View
        style={styles.placeholderCard}
        testID={isReported ? 'post-reported-placeholder' : 'post-hidden-placeholder'}>
        <Text style={styles.placeholderTitle}>{isReported ? 'Report sent' : 'Post hidden'}</Text>
        <Text style={styles.placeholderCopy}>
          {isReported
            ? 'We\u2019ll review this post.'
            : 'We\u2019ll show you fewer posts like this.'}
        </Text>
        <Pressable
          accessibilityRole="button"
          testID="post-placeholder-undo"
          disabled={placeholder.undoPending}
          onPress={undoPlaceholder}
          style={[styles.placeholderUndo, placeholder.undoPending && styles.pendingAction]}>
          <Text style={styles.placeholderUndoText}>Undo</Text>
        </Pressable>
      </View>
    );
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
            ref={optionsButtonRef}
            collapsable={false}
            accessibilityRole="button"
            accessibilityLabel="Open post options"
            hitSlop={10}
            onPress={openOptionsMenu}
            style={styles.optionsButton}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={18}
              color={pastelColors.auth.deepText}
            />
          </Pressable>
        ) : null}
      </View>

      {optionsVisible ? (
        <Modal
          transparent
          visible
          animationType="fade"
          onRequestClose={() => setOptionsVisible(false)}>
          <Pressable
            testID="post-options-backdrop"
            style={styles.optionsOverlay}
            onPress={() => setOptionsVisible(false)}>
            <View
              testID="post-options-menu"
              style={[
                styles.optionsMenu,
                optionsMenuPosition || fallbackOptionsMenuPosition,
              ]}
              onStartShouldSetResponder={() => true}>
              <Pressable
                accessibilityRole="button"
                testID="post-action-not-interested"
                android_ripple={{color: pastelColors.auth.primaryOverlay}}
                onPress={handleNotInterested}
                style={({pressed}) => [
                  styles.optionsMenuItem,
                  pressed && styles.optionsMenuItemPressed,
                ]}>
                <MaterialCommunityIcons
                  name="eye-off-outline"
                  size={18}
                  color={pastelColors.auth.deepText}
                />
                <Text style={styles.optionsMenuText}>Not interested</Text>
              </Pressable>
              <View testID="post-options-divider" style={styles.optionsMenuDivider} />
              <Pressable
                accessibilityRole="button"
                testID="post-action-report"
                android_ripple={{color: pastelColors.auth.primaryOverlay}}
                onPress={openReportModal}
                style={({pressed}) => [
                  styles.optionsMenuItem,
                  pressed && styles.optionsMenuItemPressed,
                ]}>
                <MaterialCommunityIcons
                  name="flag-outline"
                  size={18}
                  color={pastelColors.error}
                />
                <Text style={[styles.optionsMenuText, styles.reportMenuText]}>Report</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      ) : null}

      {reportModalVisible ? (
        <Modal
          transparent
          visible
          animationType="fade"
          onRequestClose={() => setReportModalVisible(false)}>
          <KeyboardAvoidingView behavior="padding" style={styles.reportOverlay}>
          <Pressable
            testID="post-report-backdrop"
            style={styles.reportFlex}
            onPress={() => setReportModalVisible(false)}>
            <View
              testID="post-report-modal"
              style={[styles.reportDialog, {marginBottom: keyboardHeight > 0 ? 12 : 0}]}
              onStartShouldSetResponder={() => true}>
              <Text style={styles.reportTitle}>Report post</Text>
              <Text style={styles.reportSubtitle}>Why are you reporting this?</Text>
              <View style={styles.reasonList}>
                {REPORT_REASONS.map(reason => {
                  const selected = selectedReportReason === reason.value;
                  return (
                    <Pressable
                      key={reason.value}
                      accessibilityRole="button"
                      testID={`post-report-reason-${reason.value}`}
                      onPress={() => setSelectedReportReason(reason.value)}
                      style={[styles.reasonOption, selected && styles.reasonOptionSelected]}>
                      <Text
                        style={[
                          styles.reasonText,
                          selected && styles.reasonTextSelected,
                        ]}>
                        {reason.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <TextInput
                testID="post-report-details"
                value={reportDetails}
                onChangeText={setReportDetails}
                placeholder="Add details, optional"
                placeholderTextColor={pastelColors.auth.mutedText}
                multiline
                scrollEnabled
              maxLength={500}
                style={styles.reportDetailsInput}
              />
              <Pressable
                accessibilityRole="button"
                testID="post-report-submit"
                disabled={!selectedReportReason || reportPending}
                onPress={submitReport}
                style={[
                  styles.reportSubmit,
                  (!selectedReportReason || reportPending) && styles.reportSubmitDisabled,
                ]}>
                <Text style={styles.reportSubmitText}>
                  {reportPending ? 'Submitting...' : 'Submit report'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
          </KeyboardAvoidingView>
        </Modal>
      ) : null}

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
              color={pastelColors.primary}
              testID="post-like-burst-icon"
            />
          </Animated.View>
        </View>
      ) : null}

      {!compact ? (
        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Comments, ${formatCount(post.engagement.commentsCount)}`}
            testID="post-comment-action"
            hitSlop={8}
            onPress={() => {
              if (onCommentPress) onCommentPress();
              else setCommentsOpen(true);
            }}
            style={styles.commentAction}>
            <CommentIcon width={24} height={22} />
            <Text style={styles.actionCount}>{formatCount(post.engagement.commentsCount)}</Text>
          </Pressable>
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
                  color={pastelColors.primary}
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Comments, ${post.engagement.commentsCount}`}
            onPress={() => {
              if (onCommentPress) onCommentPress();
              else setCommentsOpen(true);
            }}>
            <Text style={styles.engagement}>Comments {post.engagement.commentsCount}</Text>
          </Pressable>
        </View>
      ) : null}

      <Modal
        transparent
        visible={commentsOpen}
        animationType="slide"
        onRequestClose={() => setCommentsOpen(false)}>
        <KeyboardAvoidingView behavior="padding" style={styles.commentsOverlay}>
        <Pressable style={styles.commentsDismiss} onPress={() => setCommentsOpen(false)}>
          <View
            testID="post-comments-sheet"
            style={[styles.commentsSheet, {paddingBottom: 16 + keyboardHeight}]}
            onStartShouldSetResponder={() => true}>
            <Text style={styles.reportTitle}>Comments {formatCount(post.engagement.commentsCount)}</Text>
            <Text style={styles.reportSubtitle}>Write a comment on this post.</Text>
            <TextInput
              testID="post-comment-input"
              value={commentDraft}
              onChangeText={setCommentDraft}
              placeholder="Write a comment"
              placeholderTextColor={pastelColors.auth.mutedText}
                multiline
                scrollEnabled
              style={styles.reportDetailsInput}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send comment"
              disabled={!commentDraft.trim() || commentSending}
              onPress={async () => {
                if (!commentDraft.trim() || commentSending) return;
                setCommentSending(true);
                try {
                  await commentOnPost(post.id, commentDraft.trim());
                  setCommentDraft('');
                  setCommentsOpen(false);
                  showToast('Comment sent');
                } catch (err) {
                  showToast('Could not send comment. Please try again.');
                } finally {
                  setCommentSending(false);
                }
              }}
              style={[
                styles.reportSubmit,
                (!commentDraft.trim() || commentSending) && styles.reportSubmitDisabled,
              ]}>
              <Text style={styles.reportSubmitText}>
                {commentSending ? 'Sending...' : 'Send comment'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
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
  placeholderCard: {
    position: 'relative',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: pastelColors.auth.glassSurfaceStrong,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
  },
  placeholderTitle: {
    color: pastelColors.auth.deepText,
    fontSize: 14,
    fontWeight: '900',
  },
  placeholderCopy: {
    marginTop: 5,
    color: pastelColors.auth.mutedText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  placeholderUndo: {
    alignSelf: 'flex-start',
    marginTop: 11,
    paddingVertical: 6,
  },
  placeholderUndoText: {
    color: pastelColors.accent,
    fontSize: 12,
    fontWeight: '900',
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
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  optionsMenu: {
    position: 'absolute',
    width: OPTIONS_MENU_WIDTH,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: pastelColors.white,
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
    shadowColor: pastelColors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 5},
    elevation: 6,
  },
  optionsMenuItem: {
    minHeight: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionsMenuItemPressed: {
    backgroundColor: pastelColors.auth.primaryOverlay,
  },
  optionsMenuDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 40,
    backgroundColor: pastelColors.auth.glassBorder,
  },
  optionsMenuText: {
    color: pastelColors.auth.deepText,
    fontSize: 13,
    fontWeight: '800',
  },
  reportMenuText: {
    color: pastelColors.error,
  },
  reportOverlay: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(50, 17, 31, 0.26)',
  },
  reportFlex: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportDialog: {
    width: '100%',
    maxWidth: 360,
    padding: 16,
    borderRadius: 8,
    backgroundColor: pastelColors.white,
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
  },
  reportTitle: {
    color: pastelColors.auth.deepText,
    fontSize: 18,
    fontWeight: '900',
  },
  reportSubtitle: {
    marginTop: 6,
    color: pastelColors.auth.mutedText,
    fontSize: 12,
    fontWeight: '800',
  },
  reasonList: {
    marginTop: 12,
    gap: 7,
  },
  reasonOption: {
    minHeight: 34,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
    backgroundColor: pastelColors.auth.glassSurfaceStrong,
  },
  reasonOptionSelected: {
    borderColor: pastelColors.primary,
    backgroundColor: pastelColors.auth.primaryOverlay,
  },
  reasonText: {
    color: pastelColors.auth.deepText,
    fontSize: 12,
    fontWeight: '800',
  },
  reasonTextSelected: {
    color: pastelColors.accent,
  },
  reportDetailsInput: {
    height: 96,
    maxHeight: 96,
    minHeight: 64,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
    color: pastelColors.auth.deepText,
    fontSize: 12,
    fontWeight: '700',
    textAlignVertical: 'top',
  },
  reportSubmit: {
    marginTop: 12,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: pastelColors.accent,
  },
  reportSubmitDisabled: {
    opacity: 0.45,
  },
  reportSubmitText: {
    color: pastelColors.white,
    fontSize: 13,
    fontWeight: '900',
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
  commentsOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(50, 17, 31, 0.26)',
  },
  commentsDismiss: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  commentsSheet: {
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: pastelColors.white,
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
