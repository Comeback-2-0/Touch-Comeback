import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {api} from '../../utils/api';
import {pastelColors} from '../../theme/colors';
import type {CommunityStackParamList} from '../../navigation/CommunityStack';
import CommunityPostCard from './CommunityPostCard';

type Route = RouteProp<CommunityStackParamList, 'CommunityQueue'>;
type Navigation = NativeStackNavigationProp<CommunityStackParamList>;
type Post = {
  id: string;
  alias: string;
  text: string;
  score: number;
  myVote?: number;
  link?: string;
  media?: {type?: string; url?: string; mimeType?: string} | null;
};

export default function CommunityQueueScreen() {
  const navigation = useNavigation<Navigation>();
  const {
    params: {community},
  } = useRoute<Route>();
  const communityId = community.id || community._id;
  const [posts, setPosts] = useState<Post[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async ({refresh = false} = {}) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const r = await api.get(`/communities/${communityId}/content/queue`);
      setPosts(r.data.posts || []);
      setCanManage(Boolean(r.data.canManage));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Could not load review queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [communityId]);

  useEffect(() => {
    load();
  }, [load]);

  const vote = async (id: string, value: number) => {
    try {
      const r = await api.post(`/communities/${communityId}/content/${id}/vote`, {value});
      const updated = r.data.post;
      setPosts(current =>
        current.map(post => (post.id === id ? {...post, ...updated} : post)),
      );
    } catch {
      Alert.alert('Could not vote', 'Please try again.');
    }
  };

  const publishOne = async (id: string) => {
    setBusyId(id);
    try {
      await api.post(`/communities/${communityId}/content/${id}/publish`);
      Alert.alert('Published', 'This post is now live in the community.');
      await load();
    } catch {
      Alert.alert('Could not publish', 'Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const publishTop = async () => {
    setBusyId('top');
    try {
      await api.post(`/communities/${communityId}/content/queue/publish-top`);
      Alert.alert('Published top post', 'Highest-voted queue post is now live.');
      await load();
    } catch (err: any) {
      Alert.alert(
        'Could not publish top',
        err?.response?.data?.error || 'Please try again.',
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={pastelColors.auth.deepText} />
        </Pressable>
        <Text style={styles.title}>Review queue</Text>
        {canManage && posts.length ? (
          <Pressable onPress={publishTop} disabled={busyId === 'top'}>
            <Text style={styles.topAction}>
              {busyId === 'top' ? '…' : 'Publish top'}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={pastelColors.accent} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={p => p.id}
          refreshing={refreshing}
          onRefresh={() => load({refresh: true})}
          contentContainerStyle={posts.length ? styles.list : styles.empty}
          ListHeaderComponent={
            <View style={styles.queueInfo}>
              <Text style={styles.queueInfoTitle}>
                {canManage ? 'Votes help you choose what to publish.' : 'Votes help moderators choose what to publish.'}
              </Text>
              <Text style={styles.queueInfoCopy}>
                Posts stay in place after your vote and reorder when the queue refreshes.
              </Text>
              {error ? <Text style={styles.inlineError}>{error}</Text> : null}
            </View>
          }
          renderItem={({item}) => (
            <View style={styles.card}>
              <CommunityPostCard
                alias={item.alias}
                caption={item.text}
                media={item.media}
                link={item.link}
              />
              <View style={styles.actions}>
                <Pressable onPress={() => vote(item.id, 1)}>
                  <Text style={[styles.vote, item.myVote === 1 && styles.voteActive]}>↑</Text>
                </Pressable>
                <Text style={styles.score}>{item.score}</Text>
                <Pressable onPress={() => vote(item.id, -1)}>
                  <Text style={[styles.vote, item.myVote === -1 && styles.voteActive]}>↓</Text>
                </Pressable>
                {canManage ? (
                  <Pressable
                    onPress={() => publishOne(item.id)}
                    disabled={busyId === item.id}
                    style={styles.publish}>
                    <Text style={styles.publishText}>
                      {busyId === item.id ? 'Sending…' : 'Send to community'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>No posts in review</Text>
              <Text style={styles.copy}>Be the first to submit one.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: pastelColors.auth.background},
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {fontSize: 18, fontWeight: '900', color: pastelColors.auth.deepText},
  topAction: {fontWeight: '900', color: pastelColors.accent},
  headerSpacer: {width: 72},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  list: {padding: 16, paddingBottom: 28},
  empty: {flexGrow: 1, padding: 16},
  queueInfo: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: pastelColors.auth.glassSurface,
  },
  queueInfoTitle: {fontWeight: '900', color: pastelColors.auth.deepText},
  queueInfoCopy: {marginTop: 4, color: pastelColors.auth.mutedText, fontWeight: '700', lineHeight: 18},
  inlineError: {marginTop: 8, color: pastelColors.accent, fontWeight: '800'},
  card: {
    marginBottom: 14,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: pastelColors.white,
  },
  actions: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  vote: {fontSize: 24, fontWeight: '900', color: pastelColors.auth.mutedText},
  voteActive: {color: pastelColors.accent},
  score: {fontWeight: '900', color: pastelColors.auth.deepText, minWidth: 24, textAlign: 'center'},
  publish: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: pastelColors.accent,
  },
  publishText: {color: pastelColors.white, fontWeight: '900', fontSize: 12},
  emptyTitle: {fontSize: 18, fontWeight: '900', color: pastelColors.auth.deepText},
  copy: {marginTop: 6, color: pastelColors.auth.mutedText, fontWeight: '700'},
});
