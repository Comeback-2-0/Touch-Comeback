import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
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
  const [comment, setComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const [feed, comments] = await Promise.all([
      api.get(`/communities/${communityId}/content/feed`),
      api.get(`${base}/comments`),
    ]);
    const found = (feed.data.posts || []).find((item: any) => item.id === contentId);
    if (!found) {
      setPost(undefined);
      return;
    }
    setPost({
      ...found,
      comments: comments.data.comments || found.comments || [],
    });
  }, [base, communityId, contentId]);

  useEffect(() => {
    load();
  }, [load]);

  const comments: Comment[] = useMemo(() => post?.comments || [], [post]);

  const react = async (value: string) => {
    const response = await api.post(`${base}/react`, {value});
    if (response.data.post) setPost(response.data.post);
    else await load();
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

  if (!post) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={pastelColors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={pastelColors.auth.deepText} />
        </Pressable>
        <Text style={styles.heading}>Anonymous post</Text>
        <Pressable
          onPress={() => Share.share({message: `Join ${community.name} on Touch`})}>
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
              onPress={() =>
                Alert.alert('Report post', 'Report this content?', [
                  {text: 'Cancel', style: 'cancel'},
                  {
                    text: 'Report',
                    style: 'destructive',
                    onPress: () => api.post(`${base}/report`).then(load),
                  },
                ])
              }>
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
  content: {padding: 16, paddingBottom: 32},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
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
