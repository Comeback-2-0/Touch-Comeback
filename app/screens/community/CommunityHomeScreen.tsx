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
import {useAuthStore} from '../../features/profile/store/authStore';
import type {CommunityStackParamList} from '../../navigation/CommunityStack';
import CommunityJoinRequestSheet from './CommunityJoinRequestSheet';
import CommunityPostCard from './CommunityPostCard';

type Route = RouteProp<CommunityStackParamList, 'CommunityHome'>;
type Navigation = NativeStackNavigationProp<CommunityStackParamList>;
type Post = {
  id: string;
  alias: string;
  text: string;
  score: number;
  comments: unknown[];
  link?: string;
  media?: {type?: string; url?: string; mimeType?: string} | null;
};
type JoinRequest = {
  id: string;
  status: 'pending' | 'approved' | 'declined' | string;
  alias?: string;
  revealUsername?: boolean;
  revealedUsername?: string;
};

export default function CommunityHomeScreen() {
  const navigation = useNavigation<Navigation>();
  const {params: {community: routeCommunity}} = useRoute<Route>();
  const id = routeCommunity.id || routeCommunity._id;
  const username =
    useAuthStore(state => state.profile?.username) ||
    useAuthStore(state => state.user?.username) ||
    '';

  const [community, setCommunity] = useState<any>(routeCommunity);
  const [posts, setPosts] = useState<Post[]>([]);
  const [membership, setMembership] = useState<any>();
  const [joinRequest, setJoinRequest] = useState<JoinRequest | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const joined = membership?.status === 'active';
  const manager = ['owner', 'moderator'].includes(membership?.role);
  const pending = joinRequest?.status === 'pending';
  const declined = joinRequest?.status === 'declined';

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const info = await api.get(`/communities/${id}`);
      const nextCommunity = info.data.community || routeCommunity;
      const m = info.data.membership;
      setCommunity(nextCommunity);
      setMembership(m);
      setJoinRequest(info.data.joinRequest || null);
      setPendingCount(Number(info.data.pendingJoinRequestCount || 0));
      if (nextCommunity?.contentVisibility !== 'members' || m?.status === 'active') {
        const feed = await api.get(`/communities/${id}/content/feed`);
        setPosts(feed.data.posts || []);
      } else {
        setPosts([]);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id, routeCommunity]);

  useEffect(() => {
    load();
  }, [load]);

  const joinOpen = async () => {
    try {
      await api.post(`/communities/${id}/join`);
      await load();
    } catch {
      Alert.alert('Could not join', 'Please try again in a moment.');
    }
  };

  const openJoinFlow = () => {
    if (community?.joinMode === 'approval') {
      setSheetOpen(true);
      return;
    }
    joinOpen();
  };

  const sendRequest = async (payload: {
    useAlias: boolean;
    alias: string;
    revealUsername: boolean;
    username: string;
  }) => {
    setSending(true);
    try {
      const response = await api.post(`/communities/${id}/join`, payload);
      setJoinRequest(response.data.joinRequest || response.data.request || null);
      setSheetOpen(false);
      await load();
    } catch (err: any) {
      Alert.alert(
        'Could not send request',
        err?.response?.data?.error || 'Please try again in a moment.',
      );
    } finally {
      setSending(false);
    }
  };

  const cancelRequest = async () => {
    try {
      await api.delete(`/communities/${id}/join-requests/me`);
      setJoinRequest(null);
      await load();
    } catch {
      Alert.alert('Could not cancel request', 'Please try again.');
    }
  };

  const memberOptions = () =>
    Alert.alert('Community options', '', [
      {
        text: 'Mute notifications',
        onPress: () => api.put(`/communities/${id}/mute`, {muted: true}),
      },
      {
        text: 'Leave community',
        style: 'destructive',
        onPress: async () => {
          await api.post(`/communities/${id}/leave`);
          navigation.goBack();
        },
      },
      {text: 'Cancel', style: 'cancel'},
    ]);

  const statusBlock = () => {
    if (joined) return null;
    if (pending) {
      return (
        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>Request sent</Text>
          <Text style={styles.copy}>Admins still need to approve you.</Text>
          <Pressable onPress={cancelRequest} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Cancel request</Text>
          </Pressable>
        </View>
      );
    }
    if (declined) {
      return (
        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>Declined</Text>
          <Text style={styles.copy}>You can ask again with a different alias or username.</Text>
          <Pressable onPress={() => setSheetOpen(true)} style={styles.button}>
            <Text style={styles.buttonText}>Request again</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <Pressable onPress={openJoinFlow} style={styles.button}>
        <Text style={styles.buttonText}>
          {community?.contentVisibility === 'members' ? 'Join community' : 'Join to post'}
        </Text>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={pastelColors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.title}>Could not load this community</Text>
          <Pressable onPress={load} style={styles.button}>
            <Text style={styles.buttonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (community?.contentVisibility === 'members' && !joined) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Feather name="lock" size={28} color={pastelColors.accent} />
          <Text style={styles.title}>{community.name}</Text>
          <Text style={styles.copy}>
            {community.description || 'Join to view this anonymous community.'}
          </Text>
          {statusBlock()}
        </View>
        <CommunityJoinRequestSheet
          visible={sheetOpen}
          username={username}
          submitting={sending}
          onClose={() => setSheetOpen(false)}
          onSubmit={sendRequest}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={pastelColors.auth.deepText} />
        </Pressable>
        <Text style={styles.head}>{community.name}</Text>
        <View style={styles.actions}>
          {manager ? (
            <Pressable
              onPress={() => navigation.navigate('CommunityManage', {community})}
              style={styles.manageButton}>
              <Feather name="settings" size={20} color={pastelColors.auth.deepText} />
              {pendingCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pendingCount > 9 ? '9+' : pendingCount}</Text>
                </View>
              ) : null}
            </Pressable>
          ) : null}
          {joined ? (
            <Pressable onPress={memberOptions}>
              <Feather name="more-horizontal" size={20} color={pastelColors.auth.deepText} />
            </Pressable>
          ) : null}
          {joined ? (
            <Pressable onPress={() => navigation.navigate('CommunityQueue', {community})}>
              <Feather name="list" size={20} color={pastelColors.auth.deepText} />
            </Pressable>
          ) : null}
          {joined ? (
            <Pressable onPress={() => navigation.navigate('CommunityCompose', {community})}>
              <Feather name="plus-square" size={21} color={pastelColors.auth.deepText} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={p => p.id}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={posts.length ? styles.list : styles.empty}
        ListHeaderComponent={
          <View style={styles.about}>
            <Text style={styles.title}>{community.name}</Text>
            <Text style={styles.copy}>{community.description}</Text>
            <Text style={styles.members}>
              {community.membersCount || 0} members · Anonymous feed
            </Text>
            {statusBlock()}
          </View>
        }
        renderItem={({item}) => (
          <Pressable
            onPress={() => navigation.navigate('CommunityPost', {community, contentId: item.id})}
            style={styles.card}>
            <CommunityPostCard
              alias={item.alias}
              caption={item.text}
              media={item.media}
              link={item.link}
            />
            <Text style={styles.meta}>
              {item.score} votes · {item.comments.length} comments
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.title}>Nothing published yet</Text>
            <Text style={styles.copy}>Submissions are still in review.</Text>
          </View>
        }
      />

      <CommunityJoinRequestSheet
        visible={sheetOpen}
        username={username}
        submitting={sending}
        onClose={() => setSheetOpen(false)}
        onSubmit={sendRequest}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: pastelColors.auth.background},
  header: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  head: {maxWidth: '50%', fontSize: 18, fontWeight: '900', color: pastelColors.auth.deepText},
  actions: {flexDirection: 'row', gap: 16, alignItems: 'center'},
  manageButton: {position: 'relative', padding: 2},
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastelColors.accent,
  },
  badgeText: {color: pastelColors.white, fontSize: 10, fontWeight: '900'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24},
  title: {fontSize: 20, fontWeight: '900', color: pastelColors.auth.deepText, textAlign: 'center'},
  copy: {
    marginTop: 6,
    color: pastelColors.auth.mutedText,
    fontWeight: '700',
    textAlign: 'center',
  },
  button: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: pastelColors.accent,
  },
  buttonText: {color: pastelColors.white, fontWeight: '900'},
  secondaryButton: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: pastelColors.auth.glassSurface,
  },
  secondaryButtonText: {color: pastelColors.auth.deepText, fontWeight: '800'},
  statusBox: {marginTop: 16, alignItems: 'center'},
  statusTitle: {fontSize: 18, fontWeight: '900', color: pastelColors.auth.deepText},
  list: {padding: 16},
  empty: {flexGrow: 1, padding: 16},
  about: {paddingBottom: 16},
  members: {marginTop: 8, color: pastelColors.accent, fontWeight: '800', textAlign: 'center'},
  card: {
    marginBottom: 10,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: pastelColors.white,
  },
  meta: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    color: pastelColors.auth.mutedText,
    fontWeight: '700',
  },
});
