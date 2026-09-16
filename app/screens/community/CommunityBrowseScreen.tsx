import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {api} from '../../utils/api';
import {pastelColors} from '../../theme/colors';
import type {CommunityStackParamList, CommunitySummary} from '../../navigation/CommunityStack';

type Navigation = NativeStackNavigationProp<CommunityStackParamList>;
type BrowseMode = 'trending' | 'mine';

function describeJoinMode(item: CommunitySummary) {
  if (item.joinMode === 'approval') return 'Approval';
  if (item.joinMode === 'invite-only') return 'Invite only';
  return 'Open';
}

function describeVisibility(item: CommunitySummary) {
  return item.contentVisibility === 'members' ? 'Members only' : 'Public feed';
}

export default function CommunityBrowseScreen() {
  const navigation = useNavigation<Navigation>();
  const [communities, setCommunities] = useState<CommunitySummary[]>([]);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<BrowseMode>('trending');
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchProgress = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const load = useCallback(async ({refresh = false} = {}) => {
    if (refresh) {
      setRefreshing(true);
    } else if (!communities.length) {
      setInitialLoading(true);
    }
    setError('');
    try {
      if (mode === 'mine') {
        const response = await api.get<{communities: CommunitySummary[]}>('/communities/mine');
        setCommunities(response.data.communities || []);
      } else {
        const response = await api.get<CommunitySummary[]>('/communities', {
          params: query.trim() ? {q: query.trim()} : undefined,
        });
        setCommunities(response.data || []);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          (mode === 'mine' ? 'Could not load your communities' : 'Could not load communities'),
      );
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [communities.length, mode, query]);

  useEffect(() => {
    const timer = setTimeout(() => load(), searchOpen && mode === 'trending' ? 250 : 0);
    return () => clearTimeout(timer);
  }, [load, mode, searchOpen]);

  useEffect(() => {
    Animated.timing(searchProgress, {
      toValue: searchOpen ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start(() => {
      if (searchOpen) inputRef.current?.focus();
    });
  }, [searchOpen, searchProgress]);

  const openSearch = () => {
    setMode('trending');
    setSearchOpen(true);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
  };

  const emptyTitle = query.trim()
    ? 'No matching communities'
    : mode === 'mine'
      ? 'No joined communities yet'
      : 'No trending communities yet';
  const emptyCopy = query.trim()
    ? 'Try a different name or description.'
    : mode === 'mine'
      ? 'Join a community and it will show up here.'
      : 'Create the first anonymous corner.';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>Find your anonymous corner</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search communities"
          onPress={openSearch}
          style={styles.iconButton}>
          <Feather name="search" size={22} color={pastelColors.auth.deepText} />
        </Pressable>
      </View>

      <Animated.View
        style={[
          styles.search,
          {
            height: searchProgress.interpolate({inputRange: [0, 1], outputRange: [0, 48]}),
            opacity: searchProgress,
            marginBottom: searchProgress.interpolate({inputRange: [0, 1], outputRange: [0, 12]}),
          },
        ]}
        pointerEvents={searchOpen ? 'auto' : 'none'}>
        <Feather name="search" size={18} color={pastelColors.auth.mutedText} />
        <TextInput
          ref={inputRef}
          accessibilityLabel="Search communities"
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or description"
          placeholderTextColor={pastelColors.auth.mutedText}
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close search"
          onPress={closeSearch}
          style={styles.smallIconButton}>
          <Feather name="x" size={18} color={pastelColors.auth.mutedText} />
        </Pressable>
      </Animated.View>

      <View style={styles.tabs}>
        {(['trending', 'mine'] as BrowseMode[]).map(item => {
          const selected = mode === item;
          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{selected}}
              onPress={() => {
                setMode(item);
                if (item === 'mine') closeSearch();
              }}
              style={[styles.tab, selected && styles.tabSelected]}>
              <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
                {item === 'trending' ? 'Trending' : 'My communities'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create community"
        onPress={() => navigation.navigate('CommunityCreate')}
        style={styles.createButton}>
        <Feather name="plus-circle" size={19} color={pastelColors.white} />
        <Text style={styles.createText}>Create community</Text>
      </Pressable>

      {initialLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={pastelColors.accent} />
          <Text style={styles.copy}>Loading communities...</Text>
        </View>
      ) : error && !communities.length ? (
        <View style={styles.center}>
          <Feather name="wifi-off" size={28} color={pastelColors.accent} />
          <Text style={styles.emptyTitle}>{error}</Text>
          <Pressable onPress={() => load()} style={styles.retry}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={communities}
          keyExtractor={item => item.id || item._id}
          refreshing={refreshing}
          onRefresh={() => load({refresh: true})}
          contentContainerStyle={communities.length ? styles.list : styles.empty}
          ListHeaderComponent={
            error ? <Text style={styles.inlineError}>{error}</Text> : null
          }
          renderItem={({item}) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.name}`}
              onPress={() => navigation.navigate('CommunityHome', {community: item})}
              style={styles.card}>
              {item.image ? (
                <Image source={{uri: item.image}} style={styles.image} />
              ) : (
                <View style={styles.imageFallback}>
                  <Feather name="users" size={24} color={pastelColors.accent} />
                </View>
              )}
              <View style={styles.cardText}>
                <View style={styles.cardTop}>
                  <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
                  <Text style={styles.members}>{item.membersCount || 0}</Text>
                </View>
                <Text numberOfLines={2} style={styles.description}>
                  {item.description || 'An anonymous place to connect.'}
                </Text>
                <View style={styles.badges}>
                  <Text style={styles.badge}>{describeVisibility(item)}</Text>
                  <Text style={styles.badge}>{describeJoinMode(item)}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={pastelColors.auth.mutedText} />
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Feather name="users" size={28} color={pastelColors.accent} />
              <Text style={styles.emptyTitle}>{emptyTitle}</Text>
              <Text style={styles.copy}>{emptyCopy}</Text>
              {!query.trim() ? (
                <Pressable
                  onPress={() => navigation.navigate('CommunityCreate')}
                  style={styles.retry}>
                  <Text style={styles.retryText}>Create community</Text>
                </Pressable>
              ) : null}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {flex: 1, paddingRight: 12},
  title: {fontSize: 28, fontWeight: '900', color: pastelColors.auth.deepText},
  subtitle: {marginTop: 2, fontWeight: '700', color: pastelColors.auth.mutedText},
  iconButton: {height: 48, width: 48, alignItems: 'center', justifyContent: 'center'},
  smallIconButton: {height: 40, width: 40, alignItems: 'center', justifyContent: 'center'},
  search: {
    overflow: 'hidden',
    marginHorizontal: 16,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: pastelColors.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {flex: 1, marginLeft: 10, color: pastelColors.auth.deepText, fontWeight: '700'},
  tabs: {flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 10},
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: pastelColors.white,
  },
  tabSelected: {backgroundColor: pastelColors.auth.deepText},
  tabText: {fontWeight: '900', color: pastelColors.auth.mutedText},
  tabTextSelected: {color: pastelColors.white},
  createButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: pastelColors.accent,
  },
  createText: {color: pastelColors.white, fontSize: 15, fontWeight: '900'},
  list: {paddingHorizontal: 16, paddingBottom: 18},
  card: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 18,
    backgroundColor: pastelColors.auth.glassSurface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {height: 56, width: 56, borderRadius: 16, marginRight: 12},
  imageFallback: {
    height: 56,
    width: 56,
    borderRadius: 16,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastelColors.auth.primaryOverlay,
  },
  cardText: {flex: 1},
  cardTop: {flexDirection: 'row', alignItems: 'center', gap: 8},
  name: {flex: 1, fontSize: 16, fontWeight: '900', color: pastelColors.auth.deepText},
  description: {marginTop: 3, color: pastelColors.auth.mutedText, fontWeight: '600', lineHeight: 18},
  members: {color: pastelColors.accent, fontWeight: '900', fontSize: 12},
  badges: {marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  badge: {
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: pastelColors.white,
    color: pastelColors.auth.mutedText,
    fontSize: 11,
    fontWeight: '800',
  },
  center: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24},
  empty: {flexGrow: 1, paddingHorizontal: 16},
  copy: {marginTop: 10, color: pastelColors.auth.mutedText, fontWeight: '700', textAlign: 'center'},
  emptyTitle: {
    marginTop: 12,
    color: pastelColors.auth.deepText,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  inlineError: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: pastelColors.white,
    color: pastelColors.auth.deepText,
    fontWeight: '800',
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
});
