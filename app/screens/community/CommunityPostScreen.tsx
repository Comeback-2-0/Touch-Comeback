import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import type {CommunityStackParamList} from '../../navigation/CommunityStack';
import {api} from '../../utils/api';
import {pastelColors} from '../../theme/colors';
import CommunityPostCard from './CommunityPostCard';

type Route = RouteProp<CommunityStackParamList, 'CommunityPost'>;

type Engagement = {
  likes?: number;
  dislikes?: number;
  likedByMe?: boolean;
  dislikedByMe?: boolean;
  reportedByMe?: boolean;
};

type Reply = Engagement & {
  id: string;
  alias: string;
  text: string;
  createdAt?: string;
};

type Comment = Engagement & {
  id: string;
  alias: string;
  text: string;
  createdAt?: string;
  replies: Reply[];
};

export default function CommunityPostScreen() {
  const navigation = useNavigation();
  const {
    params: {community, contentId},
  } = useRoute<Route>();
  const communityId = community.id || community._id;
  const base = `/communities/${communityId}/content/${contentId}`;

  const [post, setPost] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('harassment');
  const [reportContext, setReportContext] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(base);
      setPost(response.data.post);
    } catch (err: any) {
      setPost(null);
      const status = err?.response?.status;
      setError(
        status === 403
          ? 'Join this community to view the post.'
          : status === 404
            ? 'This post is unavailable.'
            : 'Could not load this post.',
      );
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    load();
  }, [load]);

  const comments: Comment[] = useMemo(() => post?.comments || [], [post]);

  const react = async (value: string) => {
    try {
      const response = await api.post(`${base}/react`, {value});
      if (response.data.post) setPost(response.data.post);
      else await load();
    } catch {
      Alert.alert('Could not react', 'Join the community or try again.');
    }
  };

  const sendComment = async () => {
    if (!comment.trim() || sending) return;
    setSending(true);
    try {
      if (replyingTo) {
        const response = await api.post(`${base}/comments/${replyingTo.id}/replies`, {
          text: comment.trim(),
        });
        if (response.data.post) setPost(response.data.post);
        else await load();
        setReplyingTo(null);
      } else {
        const response = await api.post(`${base}/comments`, {text: comment.trim()});
        if (response.data.post) setPost(response.data.post);
        else await load();
      }
      setComment('');
    } catch {
      Alert.alert('Could not send', 'Please try again.');
    } finally {
      setSending(false);
    }
  };

  const engage = async (path: string) => {
    try {
      const response = await api.post(path);
      if (response.data.post) setPost(response.data.post);
      else await load();
    } catch {
      Alert.alert('Could not update', 'Please try again.');
    }
  };

  const reportTarget = (path: string, label: string) => {
    Alert.alert(`Report ${label}`, `Report this ${label}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Report',
        style: 'destructive',
        onPress: () => engage(path),
      },
    ]);
  };

  const submitReport = async () => {
    try {
      const response = await api.post(`${base}/report`, {
        reason: reportReason,
        context: reportContext.trim(),
      });
      if (response.data.post) setPost(response.data.post);
      setReportOpen(false);
      setReportContext('');
      Alert.alert('Report sent', 'Thanks. Moderators can review it now.');
    } catch {
      Alert.alert('Could not report', 'Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Feather name="arrow-left" size={22} color={pastelColors.auth.deepText} />
          </Pressable>
          <Text style={styles.heading}>Anonymous post</Text>
          <View style={styles.iconButton} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator color={pastelColors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Feather name="arrow-left" size={22} color={pastelColors.auth.deepText} />
          </Pressable>
          <Text style={styles.heading}>Anonymous post</Text>
          <View style={styles.iconButton} />
        </View>
        <View style={styles.center}>
          <Feather name="alert-circle" size={28} color={pastelColors.accent} />
          <Text style={styles.errorTitle}>{error || 'This post is unavailable.'}</Text>
          <Pressable onPress={load} style={styles.retry}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Feather name="arrow-left" size={22} color={pastelColors.auth.deepText} />
        </Pressable>
        <Text style={styles.heading}>Anonymous post</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share post"
          style={styles.iconButton}
          onPress={() => Share.share({message: `Touch community post: ${community.name}`})}>
          <Feather name="share-2" size={21} color={pastelColors.auth.deepText} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <CommunityPostCard
            alias={post.alias}
            caption={post.text}
            media={post.media}
            link={post.link}
          />
          <View style={styles.reactions}>
            {['like', 'love', 'laugh', 'support'].map(value => (
              <Pressable key={value} onPress={() => react(value)} style={styles.pill}>
                <Text>{value}</Text>
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Report post"
              onPress={() => setReportOpen(true)}
              style={styles.iconButtonSmall}>
              <Feather name="flag" size={18} color={pastelColors.auth.mutedText} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.comments}>Comments</Text>
        {comments.map(item => (
          <View style={styles.comment} key={item.id}>
            <Text style={styles.alias}>{item.alias}</Text>
            <Text style={styles.commentText}>{item.text}</Text>
            <View style={styles.engagement}>
              <Pressable onPress={() => engage(`${base}/comments/${item.id}/like`)}>
                <Text style={[styles.action, item.likedByMe && styles.actionActive]}>
                  ↑ {item.likes || 0}
                </Text>
              </Pressable>
              <Pressable onPress={() => engage(`${base}/comments/${item.id}/dislike`)}>
                <Text style={[styles.action, item.dislikedByMe && styles.actionActive]}>
                  ↓ {item.dislikes || 0}
                </Text>
              </Pressable>
              <Pressable onPress={() => setReplyingTo(item)}>
                <Text style={styles.action}>Reply</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  reportTarget(`${base}/comments/${item.id}/report`, 'comment')
                }>
                <Text style={styles.action}>Report</Text>
              </Pressable>
            </View>

            {(item.replies || []).map(reply => (
              <View style={styles.reply} key={reply.id}>
                <Text style={styles.alias}>{reply.alias}</Text>
                <Text style={styles.commentText}>{reply.text}</Text>
                <View style={styles.engagement}>
                  <Pressable
                    onPress={() =>
                      engage(`${base}/comments/${item.id}/replies/${reply.id}/like`)
                    }>
                    <Text style={[styles.action, reply.likedByMe && styles.actionActive]}>
                      ↑ {reply.likes || 0}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      engage(`${base}/comments/${item.id}/replies/${reply.id}/dislike`)
                    }>
                    <Text
                      style={[styles.action, reply.dislikedByMe && styles.actionActive]}>
                      ↓ {reply.dislikes || 0}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      reportTarget(
                        `${base}/comments/${item.id}/replies/${reply.id}/report`,
                        'reply',
                      )
                    }>
                    <Text style={styles.action}>Report</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ))}

        {replyingTo ? (
          <View style={styles.replying}>
            <Text style={styles.replyingText}>Replying to {replyingTo.alias}</Text>
            <Pressable onPress={() => setReplyingTo(null)}>
              <Text style={styles.actionActive}>Cancel</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.composer}>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder={
              replyingTo ? 'Write a reply anonymously' : 'Write anonymously'
            }
            placeholderTextColor={pastelColors.auth.mutedText}
            style={styles.input}
          />
          <Pressable onPress={sendComment} disabled={sending || !comment.trim()}>
            <Feather
              name="send"
              size={21}
              color={comment.trim() ? pastelColors.accent : pastelColors.auth.mutedText}
            />
          </Pressable>
        </View>
      </ScrollView>
      <Modal visible={reportOpen} transparent animationType="fade" onRequestClose={() => setReportOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.reportSheet}>
            <Text style={styles.reportTitle}>Report post</Text>
            <Text style={styles.reportCopy}>Tell moderators what feels unsafe.</Text>
            {['harassment', 'hate', 'spam', 'self-harm', 'other'].map(reason => (
              <Pressable
                key={reason}
                onPress={() => setReportReason(reason)}
                style={[styles.reason, reportReason === reason && styles.reasonActive]}>
                <Text style={[styles.reasonText, reportReason === reason && styles.reasonTextActive]}>
                  {reason}
                </Text>
              </Pressable>
            ))}
            <TextInput
              value={reportContext}
              onChangeText={setReportContext}
              placeholder="Optional context"
              placeholderTextColor={pastelColors.auth.mutedText}
              multiline
              style={styles.reportInput}
            />
            <View style={styles.reportActions}>
              <Pressable onPress={() => setReportOpen(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={submitReport} style={styles.reportButton}>
                <Text style={styles.reportButtonText}>Send report</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: pastelColors.auth.background},
  header: {
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {fontWeight: '900', fontSize: 17, color: pastelColors.auth.deepText},
  iconButton: {height: 44, width: 44, alignItems: 'center', justifyContent: 'center'},
  iconButtonSmall: {height: 36, width: 36, alignItems: 'center', justifyContent: 'center'},
  content: {padding: 16, paddingBottom: 32},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24},
  errorTitle: {
    marginTop: 12,
    color: pastelColors.auth.deepText,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  retry: {
    marginTop: 16,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: pastelColors.accent,
  },
  retryText: {color: pastelColors.white, fontWeight: '900'},
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 18,
    backgroundColor: 'rgba(50, 17, 31, 0.32)',
  },
  reportSheet: {padding: 18, borderRadius: 18, backgroundColor: pastelColors.auth.background},
  reportTitle: {fontSize: 20, fontWeight: '900', color: pastelColors.auth.deepText},
  reportCopy: {marginTop: 4, marginBottom: 10, color: pastelColors.auth.mutedText, fontWeight: '700'},
  reason: {paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, marginTop: 8, backgroundColor: pastelColors.white},
  reasonActive: {backgroundColor: pastelColors.auth.deepText},
  reasonText: {fontWeight: '800', color: pastelColors.auth.deepText, textTransform: 'capitalize'},
  reasonTextActive: {color: pastelColors.white},
  reportInput: {
    marginTop: 12,
    minHeight: 80,
    padding: 12,
    borderRadius: 14,
    textAlignVertical: 'top',
    backgroundColor: pastelColors.white,
    color: pastelColors.auth.deepText,
  },
  reportActions: {marginTop: 14, flexDirection: 'row', justifyContent: 'flex-end', gap: 10},
  cancelButton: {paddingVertical: 10, paddingHorizontal: 14},
  cancelText: {fontWeight: '900', color: pastelColors.auth.mutedText},
  reportButton: {paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, backgroundColor: pastelColors.accent},
  reportButtonText: {fontWeight: '900', color: pastelColors.white},
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: pastelColors.white,
  },
  alias: {fontWeight: '900', color: pastelColors.accent},
  reactions: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: pastelColors.auth.glassSurface,
  },
  comments: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: '900',
    color: pastelColors.auth.deepText,
  },
  comment: {
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: pastelColors.white,
  },
  commentText: {marginTop: 4, color: pastelColors.auth.deepText},
  engagement: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    alignItems: 'center',
  },
  action: {fontWeight: '800', color: pastelColors.auth.mutedText},
  actionActive: {fontWeight: '900', color: pastelColors.accent},
  reply: {
    marginTop: 10,
    marginLeft: 12,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: pastelColors.accent,
  },
  replying: {
    marginTop: 14,
    paddingHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  replyingText: {fontWeight: '700', color: pastelColors.auth.mutedText},
  composer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: pastelColors.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {flex: 1, color: pastelColors.auth.deepText},
});
